"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

type Props = {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onSave: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function NoteEditor({ initialTitle = "", initialContent = "", initialTags = [], onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [loading, setLoading] = useState(false);

  async function summarize() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await res.json();
      if (data.summary) setContent((prev) => `${prev}\n\n---\nSummary:\n${data.summary}`);
    } finally {
      setLoading(false);
    }
  }

  async function generateTags() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await res.json();
      if (Array.isArray(data.tags)) setTags(Array.from(new Set([...(tags || []), ...data.tags])));
    } finally {
      setLoading(false);
    }
  }

  function tagInputString() {
    return tags.join(", ");
  }

  function setTagInput(v: string) {
    setTags(v.split(",").map((t) => t.trim()).filter(Boolean));
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border rounded-md px-3 py-2 text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={12}
        className="border rounded-md p-3 text-sm resize-y"
      />
      <input
        value={tagInputString()}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="tags, comma, separated"
        className="border rounded-md px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button disabled={loading} onClick={() => onSave({ title, content, tags })} className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          Save
        </button>
        {onDelete && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border rounded-md p-4 w-[90vw] max-w-md">
                <Dialog.Title className="font-medium mb-2">Delete note?</Dialog.Title>
                <Dialog.Description className="text-sm mb-4">This action cannot be undone.</Dialog.Description>
                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="border rounded-md px-3 py-2 text-sm">Cancel</button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <button onClick={() => onDelete?.()} className="border rounded-md px-3 py-2 text-sm bg-red-600 text-white">Delete</button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
        <div className="mx-2" />
        <button disabled={loading} onClick={summarize} className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg.white/10">Summarize with AI</button>
        <button disabled={loading} onClick={generateTags} className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg.white/10">Generate Tags</button>
      </div>
    </div>
  );
}
