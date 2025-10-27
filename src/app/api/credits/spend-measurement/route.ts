import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { txSpendCredits } from "@/lib/credits.server";

export async function POST(req: NextRequest) {
  const { uid } = await req.json(); // in your client, pass auth.currentUser.uid
  if (!uid) return NextResponse.json({ ok:false, error:"MISSING_UID" },{status:400});
  try {
    await txSpendCredits(uid, 100, { type:"spend_measurement" });
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    const msg = String(e?.message || e);
    const code = msg === "NOT_ENOUGH_CREDITS" ? 400 : 500;
    return NextResponse.json({ ok:false, error:msg },{status:code});
  }
}