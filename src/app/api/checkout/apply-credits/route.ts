import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { txSpendCredits } from "@/lib/credits.server";

export async function POST(req: NextRequest) {
  const { uid, orderId, credits } = await req.json();
  if (!uid || !orderId || typeof credits !== "number" || credits <= 0) {
    return NextResponse.json({ ok:false, error:"BAD_REQUEST" },{status:400});
  }
  try {
    await txSpendCredits(uid, credits, { type:"spend_checkout", orderId });
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    const msg = String(e?.message||e);
    return NextResponse.json({ ok:false, error:msg },{status: msg==="NOT_ENOUGH_CREDITS"?400:500 });
  }
}