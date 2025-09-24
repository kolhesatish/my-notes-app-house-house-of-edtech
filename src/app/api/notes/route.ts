import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const h = headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const tag = searchParams.get("tag");

    const filter: any = { userId };

    if (q) {
      filter.$text = { $search: q };
    }
    if (tag) {
      filter.tags = tag;
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const h = headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, tags } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }
    await dbConnect();
    const note = await Note.create({ title, content, tags: Array.isArray(tags) ? tags : [], userId });
    return NextResponse.json({ note });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
