import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { adminDb, adminFieldValue } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ ok:false, error:"MISSING_UID" }, { status:400 });

  try {
    const userRef = adminDb.doc(`users/${uid}`);
    const ledgerRef = userRef.collection("credits_ledger").doc();

    await adminDb.runTransaction(async tx => {
      const snap = await tx.get(userRef);
      const current = (snap.exists && typeof snap.get("credits")==="number") ? snap.get("credits") : 0;
      if (current < 100) throw new Error("NOT_ENOUGH_CREDITS");
      tx.update(userRef, { credits: current - 100 });
      tx.set(ledgerRef, {
        type: "spend_measurement",
        amount: -100,
        meta: {},
        createdAt: adminFieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ ok:true });
  } catch (e:any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ ok:false, error: msg }, { status: msg==="NOT_ENOUGH_CREDITS" ? 400 : 500 });
  }
}
