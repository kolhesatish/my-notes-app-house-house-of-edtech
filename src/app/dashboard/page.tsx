import Link from "next/link";
import SearchBar from "@/components/SearchBar";

async function getNotes(q?: string | null, tag?: string | null) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (tag) sp.set("tag", tag);
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notes?${sp.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.notes as any[];
}

export default async function Dashboard({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const notes = await getNotes(searchParams.q, searchParams.tag);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Notes</h1>
        <Link href="/notes/new" className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">New Note</Link>
      </div>
      <SearchBar />
      <ul className="grid gap-3 sm:grid-cols-2">
        {notes.map((n) => (
          <li key={n._id} className="border rounded-md p-3 hover:bg-black/5 dark:hover:bg-white/10 transition">
            <Link href={`/notes/${n._id}`} className="font-medium line-clamp-1 block mb-1">{n.title}</Link>
            <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2 whitespace-pre-wrap">{n.content}</p>
            {Array.isArray(n.tags) && n.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {n.tags.map((t: string) => (
                  <span key={t} className="text-xs border rounded px-2 py-0.5">{t}</span>
                ))}
              </div>
            )}
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-sm text-black/70 dark:text-white/70">No notes found.</li>
        )}
      </ul>
    </div>
  );
}
