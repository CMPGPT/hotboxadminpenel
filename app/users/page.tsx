"use client";
import AppShell from "@/components/AppShell";
import UserTable from "@/components/UserTable";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useMemo, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    disabled: boolean;
    creationTime: string | null;
    lastSignInTime: string | null;
    admin: boolean;
    userType?: string | null;
    sellerType?: string | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users/list");
        const data = await res.json();
        if (res.ok && !ignore) {
          setUsers(Array.isArray(data.users) ? data.users : []);
        } else if (!ignore) {
          setError(data?.error || "Failed to load users");
        }
      } catch (e) {
        if (!ignore) setError("Failed to load users");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const name = (u.displayName || "").toLowerCase();
      const userType = (u.userType || "").toLowerCase();
      const sellerType = (u.sellerType || "").toLowerCase();
      return (
        email.includes(q) ||
        name.includes(q) ||
        userType.includes(q) ||
        sellerType.includes(q)
      );
    });
  }, [users, search]);

  const rows = useMemo(() => {
    return filtered.map((u) => {
      const email = u.email || "unknown@example.com";
      const name = u.displayName || (email.includes("@") ? email.split("@")[0] : email);
      const initials = name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() || "?")
        .join("") || "?";
      return {
        initials,
        name: name,
        email: email,
        type: (u.userType as any) || (u.admin ? "seller" : "buyer"),
        status: u.disabled ? ("Inactive" as const) : ("Active" as const),
        subscription: (u.sellerType as any) || (u.admin ? "Admin" : "Free"),
        joinDate: u.creationTime || "-",
        lastActive: u.lastSignInTime || "-",
      };
    });
  }, [filtered]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.disabled).length;
    const sellers = users.filter((u) => (u.userType || "").toLowerCase() === "seller").length;
    const buyers = users.filter((u) => (u.userType || "").toLowerCase() === "buyer").length;
    return { total, active, sellers, buyers };
  }, [users]);

  return (
    <RequireAuth>
      <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Total Users</div><div className="text-3xl font-semibold mt-1">{stats.total}</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Active Users</div><div className="text-3xl font-semibold mt-1">{stats.active}</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Buyers</div><div className="text-3xl font-semibold mt-1">{stats.buyers}</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Sellers</div><div className="text-3xl font-semibold mt-1">{stats.sellers}</div></div>
        </div>

        <div className="card card-padding">
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-black/60 dark:text-white/60">View, search, and manage all platform users</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              placeholder="Search by name, email, user type, or seller type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
            />
            <button className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2">Export Users</button>
          </div>
        </div>

        {error ? (
          <div className="card card-padding text-red-600 dark:text-red-400">{error}</div>
        ) : null}
        {loading ? (
          <div className="card card-padding">Loading users...</div>
        ) : rows.length === 0 ? (
          <div className="card card-padding">No users found</div>
        ) : (
          <UserTable rows={rows} />
        )}
      </div>
      </AppShell>
    </RequireAuth>
  );
}


