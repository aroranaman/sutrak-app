import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { adminDb, adminProjectId } from "@/lib/admin";
import { firebaseConfig } from "@/firebase/config";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ ok: false, error: "MISSING_UID" }, { status: 400 });

  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    const credits = snap.exists ? (snap.get("credits") ?? null) : null;
    return NextResponse.json({
      ok: true,
      serverCredits: credits,
      serverProjectId: adminProjectId(),
      clientProjectId: firebaseConfig.projectId,
      hasUserDoc: snap.exists,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
