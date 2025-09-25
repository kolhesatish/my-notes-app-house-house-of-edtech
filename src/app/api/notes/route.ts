// app/api/notes/route.ts (debug version)
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

/** Normalize cookies() for different Next versions */
function hasGet(x: unknown): x is { get: (name: string) => { value?: string } | undefined } {
  return typeof x === "object" && x !== null && "get" in x && typeof (x as { get?: unknown }).get === "function";
}

async function getCookieStore() {
  const maybe = cookies() as unknown;
  if (hasGet(maybe)) return maybe as ReturnType<typeof cookies>;
  return await (maybe as Promise<ReturnType<typeof cookies>>);
}

async function getUserIdFromRequest(req: Request) {
  try {
    const store = await getCookieStore();
    const tokenFromCookie = store?.get("token")?.value ?? null;
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? null;

    console.log("DEBUG: tokenFromCookie present:", Boolean(tokenFromCookie));
    console.log("DEBUG: authHeader present:", Boolean(authHeader));
    if (tokenFromCookie) {
      try {
        const payload = verifyToken(tokenFromCookie);
        console.log("DEBUG: payload from cookie:", payload);
        if (payload?.sub) return payload.sub;
      } catch (err) {
        console.warn("DEBUG: cookie token verify failed:", err);
      }
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.slice(7).trim();
      try {
        const payload = verifyToken(bearer);
        console.log("DEBUG: payload from Authorization header:", payload);
        if (payload?.sub) return payload.sub;
      } catch (err) {
        console.warn("DEBUG: Authorization token verify failed:", err);
      }
    }

    return null;
  } catch (err) {
    console.error("DEBUG: getUserIdFromRequest error:", err);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      // include hint to help debugging in dev (do not leak tokens in prod)
      return NextResponse.json({ error: "Unauthorized - no valid token found" }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    const tag = url.searchParams.get("tag");

    const filter: Record<string, unknown> = { userId };
    if (q) (filter as Record<string, unknown>).$text = { $search: q } as unknown;
    if (tag) (filter as Record<string, unknown>).tags = tag;

    const notes = await Note.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("GET /api/notes error:", err);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized - no valid token found" }, { status: 401 });

    const body = await req.json();
    const title = (body.title || "").trim();
    const content = (body.content || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    await dbConnect();
    const note = await Note.create({ title, content, tags, userId });
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
