"use client";
import { useEffect, useState } from "react";

export default function UserDetailPanel({ email, onCloseAction }: { email: string; onCloseAction: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ id: string; data: Record<string, unknown>; auth?: Record<string, unknown> } | null>(null);
  const [actionLoading, setActionLoading] = useState<"delete" | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/get?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (!ignore) {
          if (res.ok) setData(json);
          else setError(json?.error || "Failed to load user");
        }
      } catch (e) {
        if (!ignore) setError("Failed to load user");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [email]);


  async function handleDelete() {
    if (!data?.auth || typeof data.auth.uid !== "string") return;
    setActionLoading("delete");
    try {
      const res = await fetch("/api/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: data.auth.uid }) });
      if (!res.ok) throw new Error();
      onCloseAction();
    } catch {
      // keep panel open; could show toast
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close overlay" onClick={onCloseAction} className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[85vh] overflow-auto rounded-xl bg-white dark:bg-neutral-900 shadow-xl border border-black/10 dark:border-white/10">
          <div className="card-padding bg-black/5 dark:bg-white/5 flex items-center justify-between sticky top-0 z-10">
            <div className="font-semibold">User details</div>
            <button onClick={onCloseAction} className="text-sm">Close</button>
          </div>
          <div className="card-padding">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600 dark:text-red-400">{error}</div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Detail label="UID" value={String((data.auth as any)?.uid || data.id)} />
                  <Detail label="Email" value={String((data.auth as any)?.email || (data.data as any)?.email || email)} />
                  <Detail label="Name" value={String((data.auth as any)?.displayName || (data.data as any)?.displayName || "-")} />
                  <Detail label="User Type" value={String((data.data as any)?.userType || "-")} />
                  <Detail label="Seller Type" value={String((data.data as any)?.sellerType || "-")} />
                  <Detail label="Account Type" value={String((data.data as any)?.accountType || "-")} />
                  <Detail label="Phone" value={String((data.data as any)?.phonenumber || "-")} />
                </div>
                <div className="space-y-2">
                  <Detail label="Created" value={String((data.auth as any)?.creationTime || (data.data as any)?.createdAt?._seconds || "-")} />
                  <Detail label="Last Sign-in" value={String((data.auth as any)?.lastSignInTime || (data.data as any)?.lastLogin?._seconds || "-")} />
                  <Detail label="State" value={String((data.data as any)?.stateName || "-")} />
                  <Detail label="Business" value={String((data.data as any)?.businessName || "-")} />
                  <Detail label="User Tag" value={String((data.data as any)?.user_tag || "-")} />
                  <Detail label="Provider IDs" value={Array.isArray((data.auth as any)?.providerIds) ? (data.auth as any).providerIds.join(", ") : "-"} />
                </div>
                <div className="md:col-span-2">
                  <Detail label="Bio" value={String((data.data as any)?.bio || "-")} />
                </div>
              </div>
            ) : null}
          </div>
          <div className="card-padding border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              className="rounded-lg bg-red-600 text-white px-3 py-2"
              disabled={actionLoading !== null}
              onClick={handleDelete}
            >{actionLoading === "delete" ? "Deleting..." : "Delete user"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <div className="text-black/60 dark:text-white/60">{label}</div>
      <div className="font-medium text-black dark:text-white break-all">{value}</div>
    </div>
  );
}


