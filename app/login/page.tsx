"use client";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Integrate Supabase auth. For now this is a UI-only form.
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl brand-bg text-white text-lg font-bold shadow" aria-hidden>
            HB
          </div>
          <h1 className="mt-3 text-2xl font-semibold">HotBox Admin</h1>
          <p className="text-sm text-black/60 dark:text-white/60">Sign in to continue</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="card-padding space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-lg brand-bg text-white py-2 font-medium hover:opacity-95 active:opacity-90"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


