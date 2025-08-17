"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { getFirebaseAuth, isEmailAdmin } from "@/lib/firebase";

export default function RequireAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setChecked(true);
      if (!user) {
        setAuthUser(null);
        if (pathname !== "/login") router.replace("/login");
        return;
      }
      // Check admin flag in Firestore
      if (user.email) {
        const allowed = await isEmailAdmin(user.email);
        if (!allowed) {
          await signOut(auth);
          setAuthUser(null);
          if (pathname !== "/login") router.replace("/login");
          return;
        }
      }
      setAuthUser(user);
    });
    return () => unsub();
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black/70 dark:text-white/70">
        Checking authentication...
      </div>
    );
  }

  if (!authUser) return null;
  return <>{children}</>;
}


