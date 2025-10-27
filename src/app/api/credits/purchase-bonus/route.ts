import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { txGrantCredits } from "@/lib/credits.server";

export async function POST(req: NextRequest) {
  const { uid, orderId, amountInr } = await req.json();
  if (!uid || !orderId || typeof amountInr !== "number") {
    return NextResponse.json({ ok:false, error:"BAD_REQUEST" },{status:400});
  }
  try {
    if (amountInr >= 3500) {
      await txGrantCredits(uid, 500, { type:"purchase_bonus", orderId, rupees: amountInr });
    }
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) },{status:500});
  }
}