"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<string>("system");
  const [isAuthed, setIsAuthed] = useState<null | boolean>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setIsAuthed(!!data?.authenticated);
    } catch {
      setIsAuthed(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for focus events and custom auth events to re-check auth
  useEffect(() => {
    const handleFocus = () => {
      checkAuth();
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    // Check auth when window gets focus
    window.addEventListener('focus', handleFocus);
    // Listen for custom auth change events
    window.addEventListener('authChanged', handleAuthChange);
    
    // Optional: Poll every 30 seconds (remove if you prefer event-driven approach)
    const interval = setInterval(checkAuth, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('authChanged', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  function applyTheme(t: string) {
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    if (t === "light") root.setAttribute("data-theme", "light");
    if (t === "dark") root.setAttribute("data-theme", "dark");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Update the auth state immediately after logout
      setIsAuthed(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still update state and redirect even if logout request fails
      setIsAuthed(false);
      router.push("/login");
    }
  }

  return (
    <header className="w-full border-b border-black/10 dark:border-white/20 bg-background sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight text-lg">Smart Notes</Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition">
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {isAuthed === null ? null : isAuthed ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition">Account</button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-40 bg-background border rounded-md p-1 shadow-xl z-[9999]"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item asChild>
                    <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Dashboard</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-black/10 dark:bg-white/10 my-1" />
                  <DropdownMenu.Item asChild>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Logout</button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition">Log In</Link>
              <Link href="/signup" className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}