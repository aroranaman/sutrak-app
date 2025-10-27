import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { adminDb } from "@/lib/admin";
import { firebaseConfig } from "@/firebase/config";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ ok: false, error: "MISSING_UID" }, { status: 400 });

  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    const credits = snap.exists ? (snap.get("credits") ?? null) : null;
    return NextResponse.json({
      ok: true,
      serverCredits: credits,
      adminProjectId: (admin.app().options.projectId as string | undefined) ?? null,
      clientProjectId: firebaseConfig.projectId,
      hasDoc: snap.exists,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
