import NoteEditor from "@/components/NoteEditor";
import Link from "next/link";

async function getNote(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notes/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.note as any;
}

export default async function NotePage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);
  if (!note) {
    return (
      <div>
        <p className="text-sm text-red-600">Note not found.</p>
        <Link className="underline" href="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  async function updateNote(data: { title: string; content: string; tags: string[] }) {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notes/${note._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  }

  async function deleteNote() {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notes/${note._id}`, { method: "DELETE", cache: "no-store" });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Note</h1>
      {/* Client wrapper handles navigation after save/delete */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      {/* The component below is client-side only and will manage router transitions */}
      {/* @ts-expect-error Async Server Component passing to client component */}
      <EditableNote note={note} />
      <div className="mt-4">
        <Link className="underline" href="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}

function EditableNote({ note }: { note: any }) {
  // Dynamic import avoided to keep simple client wrapper
  // This component will be compiled as a server component, so forward to client component
  // eslint-disable-next-line @next/next/no-head-element
  return (
    // @ts-ignore
    <div suppressHydrationWarning>
      {/* @ts-ignore */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      {/* The imported client component */}
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <Client note={note} />
    </div>
  );
}

// Use a separate file for client wrapper
import Client from "@/components/EditableNoteClient";
