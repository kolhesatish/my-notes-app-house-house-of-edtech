"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { set } from "mongoose";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if(loading) return;
    setLoading(true);
    setError("");
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
        setLoading(false);
      }

      const nextUrl = searchParams.get("next") || "/dashboard";
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
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
          disabled={loading}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"}
          `}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p className="text-sm mt-3">
        No account? <a className="underline" href="/signup">Sign up</a>
      </p>
    </div>
  );
}
