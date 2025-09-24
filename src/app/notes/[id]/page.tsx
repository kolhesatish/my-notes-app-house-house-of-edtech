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
      <NoteEditor
        initialTitle={note.title}
        initialContent={note.content}
        initialTags={note.tags || []}
        onSave={async (data) => {
          await fetch(`/api/notes/${note._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }}
        onDelete={async () => {
          await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
          // navigation happens on client page using history
        }}
      />
      <div className="mt-4">
        <Link className="underline" href="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}
