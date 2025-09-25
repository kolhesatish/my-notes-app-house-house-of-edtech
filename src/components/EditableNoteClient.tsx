"use client";

import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default function EditableNoteClient({ note }: { note: { _id: string; title: string; content: string; tags?: string[] } }) {
  const router = useRouter();

  return (
    <NoteEditor
      initialTitle={note.title}
      initialContent={note.content}
      initialTags={note.tags || []}
      onSave={async (data) => {
        const res = await fetch(`/api/notes/${note._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) router.refresh();
      }}
      onDelete={async () => {
        const res = await fetch(`/api/notes/${note._id}`, { method: "DELETE" });
        if (res.ok) router.push("/dashboard");
      }}
    />
  );
}
