import { cookies } from "next/headers";
import Link from "next/link";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function Home() {
  const store = await cookies();
  const token = store.get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (payload) redirect("/dashboard");
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Welcome to Smart Notes</h1>
      <p className="text-sm text-black/70 dark:text-white/70">Sign up or log in to start creating notes.</p>
      <div className="flex gap-3">
        <Link href="/signup" className="border rounded-md px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Sign Up</Link>
        <Link href="/login" className="border rounded-md px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Log In</Link>
      </div>
    </div>
  );
}
