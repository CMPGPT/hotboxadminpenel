"use client";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function AuthSignOutButton() {
  async function handleSignOut() {
    try {
      await signOut(getFirebaseAuth());
      // Redirect happens via auth guard
    } catch {
      // no-op
    }
  }

  return (
    <button onClick={handleSignOut} className="ml-3 rounded-lg border border-white/30 px-3 py-1 text-sm hover:bg-white/10">
      Sign out
    </button>
  );
}


