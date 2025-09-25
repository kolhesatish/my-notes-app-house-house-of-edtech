import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/20 bg-background mt-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Built by <span className="font-medium">Satish Kolhe</span>
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/kolhesatish"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.093.682-.218.682-.485 0-.238-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.467-1.11-1.467-.908-.622.069-.609.069-.609 1.004.071 1.532 1.032 1.532 1.032.892 1.536 2.341 1.092 2.91.835.091-.649.35-1.092.636-1.343-2.221-.253-4.555-1.114-4.555-4.955 0-1.094.39-1.988 1.03-2.689-.103-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0 1 12 6.844c.851.004 1.707.115 2.507.337 1.909-1.297 2.748-1.027 2.748-1.027.546 1.378.202 2.397.099 2.65.64.701 1.028 1.595 1.028 2.689 0 3.851-2.338 4.699-4.566 4.948.359.31.678.919.678 1.852 0 1.336-.012 2.414-.012 2.743 0 .269.18.582.688.483A10.024 10.024 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
            </svg>
            <span>GitHub</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/satish-kolhe-0a87a0226/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V23h-4V8.5zm7.5 0h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.65 4.75 6.1V23h-4v-6.5c0-1.55 0-3.55-2.2-3.55-2.2 0-2.55 1.7-2.55 3.45V23h-4V8.5z" />
            </svg>
            <span>LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}