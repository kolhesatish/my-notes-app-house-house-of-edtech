"use client";

import NoteEditor from "@/components/NoteEditor";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();

  async function onSave(data: { title: string; content: string; tags: string[] }) {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      router.push(`/notes/${json.note._id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">New Note</h1>
      <NoteEditor onSave={onSave} />
    </div>
  );
}
