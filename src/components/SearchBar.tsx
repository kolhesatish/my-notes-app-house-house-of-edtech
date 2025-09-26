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
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search title or content"
        className="input w-full sm:w-auto sm:min-w-60 px-3 py-2 rounded-lg border"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Filter by tag"
        className="input w-full sm:w-auto px-3 py-2 rounded-lg border"
      />
      <div className="flex gap-2">
        <button 
          onClick={submit} 
          className="button w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          🔍 Search
        </button>
        {hasActiveSearch && (
          <button 
            onClick={clearSearch} 
            className="button w-full sm:w-auto px-4 py-2 rounded-lg text-red-600 border border-red-300 hover:bg-red-50"
          >
            ✕ Clear
          </button>
        )}
      </div>
      {hasActiveSearch && (
        <span className="text-xs text-muted sm:ml-2 mt-1 sm:mt-0">
          Filtering {q && `"${q}"`} {q && tag && " + "} {tag && `#${tag}`}
        </span>
      )}
    </div>
  );
}
