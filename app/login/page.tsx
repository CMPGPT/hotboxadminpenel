"use client";
import { Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, isEmailAdmin } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        const allowed = await isEmailAdmin(user.email);
        if (allowed) {
          router.replace("/dashboard");
        } else {
          await signOut(auth);
        }
      }
    });
    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const allowed = await isEmailAdmin(email);
      if (!allowed) {
        await signOut(getFirebaseAuth());
        setError("This account is not an admin");
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {error ? (
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-lg brand-bg text-white py-2 font-medium hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


