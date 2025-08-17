"use client";
import Badge from "@/components/Badge";
import { Eye, Pencil, Trash2, UserX } from "lucide-react";
import UserDetailPanel from "@/components/UserDetailPanel";
import { useEffect, useRef, useState } from "react";

type Row = {
  initials: string;
  name: string;
  email: string;
  type: "Seller" | "Buyer";
  status: "Active" | "Inactive" | "Suspended";
  subscription: string;
  joinDate: string;
  lastActive: string;
};

export default function UserTable({ rows }: { rows: Row[] }) {
  const [openForEmail, setOpenForEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [detailEmail, setDetailEmail] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpenForEmail(null);
      }
    }
    if (openForEmail) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openForEmail]);
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-black dark:text-white">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Subscription</th>
              <th className="px-4 py-3 font-medium">Join Date</th>
              <th className="px-4 py-3 font-medium">Last Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email} className="border-t border-black/5 dark:border-white/10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-orange-100 text-[var(--primary)] inline-flex items-center justify-center text-xs font-semibold">{r.initials}</span>
                    <div>
                      <div className="font-medium text-black dark:text-white">{r.name}</div>
                      <div className="text-xs text-black/60 dark:text-white/60">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="blue">{r.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  {r.status === "Active" && <Badge variant="green">Active</Badge>}
                  {r.status === "Inactive" && <Badge variant="gray">Inactive</Badge>}
                  {r.status === "Suspended" && <Badge variant="red">Suspended</Badge>}
                </td>
                <td className="px-4 py-3 text-black dark:text-white">{r.subscription}</td>
                <td className="px-4 py-3 text-black dark:text-white">{r.joinDate}</td>
                <td className="px-4 py-3 text-black dark:text-white">{r.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="relative flex items-center gap-4 text-black/70 dark:text-white/70">
                    <button
                      aria-label="View"
                      title="View"
                      className="hover:text-[var(--primary)] transition-colors"
                      onClick={() => setDetailEmail(r.email)}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      aria-label="Edit"
                      title="Edit"
                      className="hover:text-[var(--primary)] transition-colors"
                      onClick={() => setOpenForEmail((prev) => (prev === r.email ? null : r.email))}
                    >
                      <Pencil size={18} />
                    </button>
                    <button aria-label="Delete" title="Delete" className="text-red-600 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>

                    {openForEmail === r.email && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-6 z-20 w-44 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg"
                      >
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] text-left"
                          onClick={() => {
                            setOpenForEmail(null);
                            // TODO: Implement suspend logic
                          }}
                        >
                          <UserX size={16} /> Suspend
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detailEmail && (
        <UserDetailPanel email={detailEmail} onClose={() => setDetailEmail(null)} />
      )}
    </div>
  );
}


