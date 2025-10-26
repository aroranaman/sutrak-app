import { NextRequest, NextResponse } from "next/server";

export type Handler = (req: NextRequest) => Promise<Response>;

export function apiSafe(handler: Handler): Handler {
  return async (req) => {
    const rid = req.headers.get("x-request-id") ?? crypto.randomUUID();
    try {
      const res = await handler(req);
      return res;
    } catch (e: any) {
      const status = Number(e?.status || e?.statusCode) || 500;
      // Log full error on the server
      // eslint-disable-next-line no-console
      console.error(`[API ERROR][${rid}]`, e);
      return NextResponse.json(
        { ok: false, error: String(e?.message || e), requestId: rid },
        { status }
      );
    }
  };
}
