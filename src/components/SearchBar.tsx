"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    setQ(params.get("q") || "");
    setTag(params.get("tag") || "");
  }, [params]);

  function submit() {
    const sp = new URLSearchParams(params.toString());
    if (q) sp.set("q", q); else sp.delete("q");
    if (tag) sp.set("tag", tag); else sp.delete("tag");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title or content"
        className="border rounded-md px-3 py-2 text-sm min-w-60"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Filter by tag"
        className="border rounded-md px-3 py-2 text-sm"
      />
      <button onClick={submit} className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Apply</button>
    </div>
  );
}
