import { NextResponse } from "next/server";
import { summarizeText } from "@/lib/ai";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const h = headers();
  const userId = h.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  const summary = await summarizeText(content);
  return NextResponse.json({ summary });
}
