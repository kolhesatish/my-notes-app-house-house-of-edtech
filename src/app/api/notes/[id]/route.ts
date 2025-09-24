import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { headers } from "next/headers";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const h = headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await dbConnect();
    const note = await Note.findOne({ _id: params.id, userId }).lean();
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const h = headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const { title, content, tags } = await req.json();
    await dbConnect();
    const note = await Note.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: { title, content, tags: Array.isArray(tags) ? tags : [] } },
      { new: true }
    ).lean();
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const h = headers();
    const userId = h.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await dbConnect();
    const result = await Note.deleteOne({ _id: params.id, userId });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
