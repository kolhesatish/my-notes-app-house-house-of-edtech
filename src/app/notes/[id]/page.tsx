import Link from "next/link";
import EditableNoteClient from "@/components/EditableNoteClient";
import { headers } from "next/headers";

type Note = { _id: string; title: string; content: string; tags?: string[] };

/**
 * Minimal, structural header-like type we can use safely in TS.
 * We don't rely on ReadonlyHeaders (which may not be defined in your TS lib).
 */
type SimpleHeaders = { get(name: string): string | null };

/** Normalize headers() result (handles both sync and Promise cases) */
function hasGetHeader(x: unknown): x is SimpleHeaders {
  return typeof x === "object" && x !== null && "get" in x && typeof (x as { get?: unknown }).get === "function";
}

async function getHeaders(): Promise<SimpleHeaders> {
  const maybe = headers() as unknown;
  if (hasGetHeader(maybe)) {
    return maybe as SimpleHeaders;
  }
  // maybe is a Promise<SimpleHeaders>
  return await (maybe as Promise<SimpleHeaders>);
}

async function getBaseUrl() {
  const h = await getHeaders();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getNote(id: string): Promise<Note | null> {
  const url = `${await getBaseUrl()}/api/notes/${id}`;
  const cookieHeader = (await getHeaders()).get("cookie") ?? "";

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.note as Note;
}

export default async function NotePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const note = await getNote(id);

  if (!note) {
    return (
      <div>
        <p className="text-sm text-red-600">Note not found.</p>
        <Link className="underline" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Note</h1>
      <EditableNoteClient note={note} />
      <div className="mt-4">
        <Link className="underline" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
