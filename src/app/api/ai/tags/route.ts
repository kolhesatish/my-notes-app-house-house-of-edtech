import { NextResponse } from "next/server";
import { suggestTags } from "@/lib/ai";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const token = cookies().get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  const tags = await suggestTags(content);
  return NextResponse.json({ tags });
}
