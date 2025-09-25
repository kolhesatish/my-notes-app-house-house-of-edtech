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
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (tag.trim()) sp.set("tag", tag.trim());
    
    const queryString = sp.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      submit();
    }
  }

  function clearSearch() {
    setQ("");
    setTag("");
    router.push(pathname);
  }

  const hasActiveSearch = q || tag;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search title or content"
        className="input min-w-60"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Filter by tag"
        className="input"
      />
      <button 
        onClick={submit} 
        className="button"
      >
        🔍 Search
      </button>
      {hasActiveSearch && (
        <button 
          onClick={clearSearch} 
          className="button text-red-600 hover:bg-red-50"
        >
          ✕ Clear
        </button>
      )}
      {hasActiveSearch && (
        <span className="text-xs text-muted">
          Filtering {q && `"${q}"`} {q && tag && " + "} {tag && `#${tag}`}
        </span>
      )}
    </div>
  );
}