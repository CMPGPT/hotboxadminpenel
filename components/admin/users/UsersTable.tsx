"use client";
import Badge from "@/components/Badge";
import { Eye, UserX, Trash2, Copy } from "lucide-react";
import UserDetailPanel from "@/components/UserDetailPanel";
import { useEffect, useRef, useState } from "react";

type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  disabled: boolean;
  creationTime?: string | null;
  lastSignInTime?: string | null;
  admin?: boolean;
  userType?: string | null;
  sellerType?: string | null;
  suspension?: {
    active: boolean;
    reason: string;
    restrictions: string[];
    loungeIds: string[];
    channel?: string;
  };
};

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onSuspendUserAction: (user: User) => void;
  onDeleteUserAction: (user: User) => void;
}

export default function UsersTable({ users, loading = false, onSuspendUserAction, onDeleteUserAction }: UsersTableProps) {
  const [detailEmail, setDetailEmail] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const copyToClipboard = async (text: string, uid: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (user: User) => {
    const name = user.displayName || user.email || "Unknown";
    return name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || "?")
      .join("") || "?";
  };

  const getUserType = (user: User) => {
    if (user.admin) return "Admin";
    return user.userType || "User";
  };

  const getSubscription = (user: User) => {
    if (user.admin) return "Admin";
    return user.sellerType || "Free";
  };

  const getStatusInfo = (user: User) => {
    if (user.suspension?.active) {
      return { status: "Suspended", variant: "red" as const };
    }
    if (user.disabled) {
      return { status: "Inactive", variant: "gray" as const };
    }
    return { status: "Active", variant: "green" as const };
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-black/5 dark:bg-white/5 rounded"></div>
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
          <div className="text-black/40 dark:text-white/40 mb-4">
            <Eye size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            No Users Found
          </h3>
          <p className="text-black/60 dark:text-white/60">
            No users match your current search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            All Users ({users.length})
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Manage user accounts, suspensions, and deletions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-black/5 dark:bg-white/5 text-black dark:text-white">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">UID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Subscription</th>
                <th className="px-4 py-3 font-medium">Join Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const statusInfo = getStatusInfo(user);
                return (
                  <tr key={user.uid} className="border-t border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8">
                          <span className={`absolute inset-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                            statusInfo.status === "Suspended" 
                              ? "bg-red-100 text-red-800" 
                              : statusInfo.status === "Inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-100 text-[var(--primary)]"
                          }`}>
                            {getInitials(user)}
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded font-mono">
                          {user.uid.slice(0, 8)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(user.uid, user.uid)}
                          className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                          title="Copy full UID"
                        >
                          {copiedUid === user.uid ? (
                            <span className="text-green-600 text-xs">✓</span>
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.status}
                        </Badge>
                        {user.suspension?.active && (
                          <div className="text-xs text-black/60 dark:text-white/60">
                            {user.suspension.restrictions.join(", ")}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.admin ? "orange" : "blue"}>
                        {getUserType(user)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-black dark:text-white">
                        {getSubscription(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-black dark:text-white">
                        {formatDate(user.creationTime)}
                      </div>
                      {user.lastSignInTime && (
                        <div className="text-xs text-black/60 dark:text-white/60">
                          Last: {formatDate(user.lastSignInTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailEmail(user.email || "")}
                          className="p-1 text-black/70 dark:text-white/70 hover:text-[var(--primary)] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onSuspendUserAction(user)}
                          className={`p-1 transition-colors ${
                            user.suspension?.active 
                              ? "text-orange-600 hover:text-orange-700" 
                              : "text-black/70 dark:text-white/70 hover:text-orange-600"
                          }`}
                          title={user.suspension?.active ? "Edit Suspension" : "Suspend User"}
                        >
                          <UserX size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteUserAction(user)}
                          className="p-1 text-black/70 dark:text-white/70 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
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

      {detailEmail && (
        <UserDetailPanel 
          email={detailEmail} 
          onCloseAction={() => setDetailEmail(null)} 
        />
      )}
    </>
  );
}
