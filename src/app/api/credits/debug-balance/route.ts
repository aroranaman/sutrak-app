import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { adminDb } from "@/lib/admin";
import { adminProjectId } from "@/lib/admin";
import { firebaseConfig } from "@/firebase/config";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ ok:false, error:"MISSING_UID" }, { status:400 });

  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    return NextResponse.json({
      ok: true,
      serverCredits: snap.exists ? (snap.get("credits") ?? null) : null,
      serverProjectId: adminProjectId(),
      clientProjectId: firebaseConfig.projectId,
      hasUserDoc: snap.exists,
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
