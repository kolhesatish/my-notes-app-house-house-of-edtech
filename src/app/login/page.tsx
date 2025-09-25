"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const nextUrl = searchParams.get("next") || "/dashboard";
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Log In</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border rounded-md px-3 py-2 text-sm"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border rounded-md px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="border rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Log In
        </button>
      </form>
      <p className="text-sm mt-3">
        No account? <a className="underline" href="/signup">Sign up</a>
      </p>
    </div>
  );
}
