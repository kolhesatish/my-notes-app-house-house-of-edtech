import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const cookie = (req as any).headers.get("cookie") as string | null;
  const token = cookie?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")?.[1];
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });
  const payload = verifyToken(token);
  return NextResponse.json({ authenticated: !!payload, userId: payload?.sub || null, email: payload?.email || null });
}
