import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { adminDb, adminFieldValue } from "@/lib/admin";

/**
 * Body:
 * { uid: string, profile: { name: string, measurements: { bust:number, hip:number, shoulder:number, sleeve:number, torso:number, inseam:number }, source?: "auto"|"edited" } }
 */
export async function POST(req: NextRequest) {
  try {
    const { uid, profile } = await req.json();

    if (!uid) return NextResponse.json({ ok: false, error: "MISSING_UID" }, { status: 400 });
    if (!profile?.name || !profile?.measurements) {
      return NextResponse.json({ ok: false, error: "MISSING_PROFILE" }, { status: 400 });
    }

    const userRef = adminDb.doc(`users/${uid}`);
    const ledgerRef = userRef.collection("credits_ledger").doc();

    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const exists = snap.exists;
      const data = (exists ? snap.data() : {}) as any;

      const currentCredits = Number(data?.credits ?? 0);
      if (currentCredits < 100) throw new Error("NOT_ENOUGH_CREDITS");

      // prepare the new profiles array
      const prevProfiles: any[] = Array.isArray(data?.profiles) ? data.profiles : [];
      const now = adminFieldValue.serverTimestamp();

      const newEntry = {
        id: profile.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: profile.name,
        measurements: profile.measurements,
        source: profile.source || "auto",
        createdAt: now,
      };

      // optional: cap total stored profiles (e.g., keep last 20)
      const capped = [...prevProfiles, newEntry].slice(-20);

      // write user doc updates (atomic with credits)
      tx.set(
        userRef,
        {
          credits: currentCredits - 100,
          profiles: capped,
          updatedAt: now,
        },
        { merge: true }
      );

      // ledger
      tx.set(ledgerRef, {
        type: "spend_measurement",
        amount: -100,
        profileId: newEntry.id,
        createdAt: now,
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const code = msg === "NOT_ENOUGH_CREDITS" ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status: code });
  }
}
