"use client";
import Badge from "@/components/Badge";
import { Edit, UserCheck, Info } from "lucide-react";
import { useState } from "react";

type SuspendedUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  suspension: {
    active: boolean;
    reason: string;
    restrictions: string[];
    loungeIds: string[];
    channel?: string;
  };
};

interface SuspendedUsersTableProps {
  users: SuspendedUser[];
  loading?: boolean;
  onEditSuspensionAction: (user: SuspendedUser) => void;
  onUnsuspendAction: (user: SuspendedUser) => void;
}

export default function SuspendedUsersTable({ 
  users, 
  loading = false, 
  onEditSuspensionAction, 
  onUnsuspendAction 
}: SuspendedUsersTableProps) {
  const [unsuspendingUser, setUnsuspendingUser] = useState<string | null>(null);
  const [expandedReason, setExpandedReason] = useState<string | null>(null);

  const handleUnsuspend = async (user: SuspendedUser) => {
    if (unsuspendingUser) return;

    const confirmed = window.confirm(
      `Are you sure you want to unsuspend ${user.displayName || user.email}?`
    );
    
    if (!confirmed) return;

    setUnsuspendingUser(user.uid);
    
    try {
      const token = await getIdToken(); // Will need to implement this helper
      const response = await fetch(`/api/users/${user.uid}/unsuspend`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unsuspend user");
      }

      onUnsuspendAction(user);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unsuspend user");
    } finally {
      setUnsuspendingUser(null);
    }
  };

  // Helper function to get ID token
  const getIdToken = async (): Promise<string> => {
    const { getIdToken } = await import("@/lib/firebase/auth");
    return await getIdToken();
  };

  const formatLoungeIds = (loungeIds: string[]) => {
    if (loungeIds.length === 0) return "-";
    if (loungeIds.length <= 3) return loungeIds.join(", ");
    return `${loungeIds.slice(0, 3).join(", ")} +${loungeIds.length - 3} more`;
  };

  const truncateReason = (reason: string, maxLength: number = 50) => {
    if (reason.length <= maxLength) return reason;
    return reason.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-black/5 dark:bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card">
        <div className="p-8 text-center">
          <UserCheck size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            No Suspended Users
          </h3>
          <p className="text-black/60 dark:text-white/60">
            All users are currently active. Suspended users will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-black/5 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Suspended Users ({users.length})
        </h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Manage currently suspended user accounts
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-black dark:text-white">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Restrictions</th>
              <th className="px-4 py-3 font-medium">Lounge IDs</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const initials = (user.displayName || user.email || "Unknown")
                .split(/[\s._-]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase() || "?")
                .join("") || "?";

              return (
                <tr key={user.uid} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8">
                        <span className="absolute inset-0 rounded-full bg-red-100 text-red-800 inline-flex items-center justify-center text-xs font-semibold">
                          {initials}
                        </span>
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={`${user.displayName || user.email || "User"} avatar`}
                            className="absolute inset-0 h-8 w-8 rounded-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-black dark:text-white">
                          {user.displayName || user.email}
                        </div>
                        <div className="text-xs text-black/60 dark:text-white/60">
                          {user.email}
                        </div>
                        <div className="text-xs text-black/40 dark:text-white/40 font-mono">
                          {user.uid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.suspension.restrictions.map((restriction) => (
                        <Badge
                          key={restriction}
                          variant={restriction === "ALL" ? "red" : restriction === "CHAT" ? "orange" : "blue"}
                        >
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-black dark:text-white">
                      {user.suspension.loungeIds.length > 0 ? (
                        <span
                          title={user.suspension.loungeIds.join(", ")}
                          className="cursor-help"
                        >
                          {formatLoungeIds(user.suspension.loungeIds)}
                        </span>
                      ) : (
                        <span className="text-black/40 dark:text-white/40">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-black dark:text-white">
                      {user.suspension.channel && user.suspension.channel.trim().length > 0 ? (
                        <span>{user.suspension.channel}</span>
                      ) : (
                        <span className="text-black/40 dark:text-white/40">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-black dark:text-white">
                        {truncateReason(user.suspension.reason)}
                      </span>
                      {user.suspension.reason.length > 50 && (
                        <button
                          onClick={() => setExpandedReason(
                            expandedReason === user.uid ? null : user.uid
                          )}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Info size={14} />
                        </button>
                      )}
                    </div>
                    {expandedReason === user.uid && (
                      <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs">
                        {user.suspension.reason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditSuspensionAction(user)}
                        className="p-1 text-black/70 dark:text-white/70 hover:text-orange-600 transition-colors"
                        title="Edit Suspension"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleUnsuspend(user)}
                        disabled={unsuspendingUser === user.uid}
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Unsuspend User"
                      >
                        {unsuspendingUser === user.uid ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin" />
                            Unsuspending...
                          </div>
                        ) : (
                          "Unsuspend"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
