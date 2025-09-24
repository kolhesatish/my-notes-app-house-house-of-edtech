import Link from "next/link";
import EditableNoteClient from "@/components/EditableNoteClient";
import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getNote(id: string) {
  const url = `${await getBaseUrl()}/api/notes/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.note as any;
}

export default async function NotePage(props: { params: Promise<{ id: string }> }) {
   const { id } = await props.params;
  const note = await getNote(id);
  if (!note) {
    return (
      <div>
        <p className="text-sm text-red-600">Note not found.</p>
        <Link className="underline" href="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Note</h1>
      <EditableNoteClient note={note} />
      <div className="mt-4">
        <Link className="underline" href="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}
