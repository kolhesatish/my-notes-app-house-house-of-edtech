"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const next = params.get("next") || "/dashboard";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push(next);
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Log In</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded-md px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border rounded-md px-3 py-2 text-sm" />
        <button className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Log In</button>
      </form>
      <p className="text-sm mt-3">No account? <Link className="underline" href="/signup">Sign up</Link></p>
    </div>
  );
}
