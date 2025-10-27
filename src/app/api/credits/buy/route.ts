import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { txGrantCredits } from "@/lib/credits.server";

export async function POST(req: NextRequest) {
  const { uid, paymentId, amountInr } = await req.json();
  if (!uid || !paymentId || typeof amountInr !== "number" || amountInr <= 0) {
    return NextResponse.json({ ok:false, error:"BAD_REQUEST" },{status:400});
  }
  try {
    await txGrantCredits(uid, amountInr, { type:"buy", paymentId });
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) },{status:500});
  }
}