import { NextResponse } from "next/server";
import { suggestTags } from "@/lib/ai";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const h = headers();
  const userId = h.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  const tags = await suggestTags(content);
  return NextResponse.json({ tags });
}
