import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

function getUserIdFromCookie(): string | null {
  const token = cookies().get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.sub || null;
}
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromCookie();
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
    const userId = getUserIdFromCookie();
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
    const userId = getUserIdFromCookie();
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
