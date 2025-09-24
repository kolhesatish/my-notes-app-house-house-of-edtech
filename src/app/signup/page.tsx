"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border rounded-md px-3 py-2 text-sm" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded-md px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border rounded-md px-3 py-2 text-sm" />
        <button className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Create account</button>
      </form>
      <p className="text-sm mt-3">Already have an account? <Link className="underline" href="/login">Log in</Link></p>
    </div>
  );
}
