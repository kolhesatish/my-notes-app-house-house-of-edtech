"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import SearchBar from "@/components/SearchBar";

type Note = { _id: string; title: string; content: string; tags?: string[] };

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);

  // Load notes from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/notes", { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || res.statusText);
        }
        const data = await res.json();
        if (!mounted) return;
        setNotes(data.notes || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load notes");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter notes based on search parameters
  useEffect(() => {
    const q = searchParams.get("q")?.toLowerCase() || "";
    const tag = searchParams.get("tag")?.toLowerCase() || "";

    if (!q && !tag) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note => {
      let matchesQuery = true;
      let matchesTag = true;

      if (q) {
        matchesQuery = 
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q);
      }

      if (tag) {
        matchesTag = note.tags?.some(t => 
          t.toLowerCase().includes(tag)
        ) || false;
      }

      return matchesQuery && matchesTag;
    });

    setFilteredNotes(filtered);
  }, [notes, searchParams]);

  const handleDelete = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { 
        method: "DELETE",
        credentials: "include" 
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || res.statusText);
      }
      
      // Remove the deleted note from both states
      setNotes(prev => prev.filter(note => note._id !== noteId));
      setFilteredNotes(prev => prev.filter(note => note._id !== noteId));
      setDeleteNote(null);
    } catch (err: any) {
      console.error("Error deleting note:", err);
      // You might want to show an error toast here
    }
  };

  if (loading) return <div className="p-4">Loading notes…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const hasSearch = searchParams.get("q") || searchParams.get("tag");
  const displayNotes = filteredNotes;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Your Notes
          {hasSearch && (
            <span className="text-sm font-normal text-muted ml-2">
              ({displayNotes.length} found)
            </span>
          )}
        </h1>
        <Link href="/notes/new" className="button">
          New Note
        </Link>
      </div>
      <SearchBar />
      
      <ul className="grid gap-3 sm:grid-cols-2">
        {displayNotes.map(n => (
          <li key={n._id} className="card">
            <div className="mb-2">
              <h3 className="font-medium line-clamp-1 mb-1">{n.title}</h3>
              <p className="text-sm line-clamp-2 whitespace-pre-wrap text-muted">{n.content}</p>
              {n.tags?.length ? (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {n.tags.map(t => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t" style={{borderColor: 'var(--border-color)'}}>
              <button
                onClick={() => setViewNote(n)}
                className="flex-1 text-xs button hover:bg-blue-50 text-blue-600"
                title="View note"
              >
                👁️ View
              </button>
              <Link
                href={`/notes/${n._id}`}
                className="flex-1 text-xs button hover:bg-green-50 text-green-600 text-center"
                title="Edit note"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={() => setDeleteNote(n)}
                className="flex-1 text-xs button hover:bg-red-50 text-red-600"
                title="Delete note"
              >
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
        {displayNotes.length === 0 && !hasSearch && (
          <li className="text-sm text-muted col-span-2">No notes found.</li>
        )}
        {displayNotes.length === 0 && hasSearch && (
          <li className="text-sm text-muted col-span-2">
            No notes match your search criteria. Try different keywords or tags.
          </li>
        )}
      </ul>

      {/* View Note Dialog */}
      <Dialog.Root open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 card w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl" style={{backgroundColor: 'var(--background)', borderColor: 'var(--border-color)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📖</span>
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold" style={{color: 'var(--foreground)'}}>
                    {viewNote?.title}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-muted">
                    View your note content
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="text-muted hover:opacity-70 text-xl">
                  ✕
                </button>
              </Dialog.Close>
            </div>
            
            <div className="card mb-4" style={{backgroundColor: 'var(--button-hover)'}}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{color: 'var(--foreground)'}}>
                {viewNote?.content}
              </div>
            </div>
            
            {viewNote?.tags?.length ? (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>Tags:</h4>
                <div className="flex gap-2 flex-wrap">
                  {viewNote.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="button">
                  Close
                </button>
              </Dialog.Close>
              <Link
                href={`/notes/${viewNote?._id}`}
                className="button"
              >
                ✏️ Edit Note
              </Link>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteNote} onOpenChange={() => setDeleteNote(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 card w-[90vw] max-w-md" style={{backgroundColor: 'var(--background)', borderColor: 'var(--border-color)'}}>
            <Dialog.Title className="font-medium mb-2" style={{color: 'var(--foreground)'}}>Delete note?</Dialog.Title>
            <Dialog.Description className="text-sm mb-4 text-muted">
              Are you sure you want to delete "{deleteNote?.title}"? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="button">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                onClick={() => deleteNote && handleDelete(deleteNote._id)} 
                className="button-danger"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}