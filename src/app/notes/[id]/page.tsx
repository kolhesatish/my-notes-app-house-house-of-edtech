import Link from "next/link";
import EditableNoteClient from "@/components/EditableNoteClient";

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
