import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("token")?.value || null;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });
  const payload = verifyToken(token);
  return NextResponse.json({ authenticated: !!payload, userId: payload?.sub || null, email: payload?.email || null });
}
