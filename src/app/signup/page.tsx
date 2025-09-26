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
  const [saving, setSaving] = useState(false);  

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (saving) return;
    setSaving(true);
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
      setSaving(false);
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
<button
  type="submit"
  disabled={saving}
  className={`
    w-full px-4 py-2 rounded-md text-sm font-medium transition-colors
    ${saving 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
      : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"}
  `}
>
  {saving ? "Creating..." : "Create Account"}
</button>
      </form>
      <p className="text-sm mt-3">Already have an account? <Link className="underline" href="/login">Log in</Link></p>
    </div>
  );
}
