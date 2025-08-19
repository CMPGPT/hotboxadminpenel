"use client";
import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import Badge from "@/components/Badge";

interface SuspendUserModalProps {
  user: {
    uid: string;
    email: string | null;
    displayName?: string | null;
    suspension?: {
      active: boolean;
      reason: string;
      restrictions: string[];
      loungeIds: string[];
      channel?: string;
    };
  } | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
  onSuspendAction?: (params: {
    uid: string;
    reason: string;
    restrictions: string[];
    loungeIds?: string[];
    channel?: string;
  }) => void;
  onUnsuspendAction?: (uid: string) => void;
  loading?: boolean;
}

type RestrictionType = "ALL" | "CHAT" | "LOUNGES";

export default function SuspendUserModal({ 
  user, 
  isOpen, 
  onCloseAction, 
  onSuccessAction, 
  onSuspendAction,
  onUnsuspendAction,
  loading: externalLoading = false
}: SuspendUserModalProps) {
  const [reason, setReason] = useState("");
  const [restrictions, setRestrictions] = useState<RestrictionType[]>(["ALL"]);
  const [loungeIds, setLoungeIds] = useState<string[]>([]);
  const [loungeInput, setLoungeInput] = useState("");
  const [channel, setChannel] = useState("");
  const [includeChannel, setIncludeChannel] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;
  const [error, setError] = useState("");

  const isEditing = user?.suspension?.active || false;

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      if (isEditing && user.suspension) {
        setReason(user.suspension.reason || "");
        setRestrictions(user.suspension.restrictions as RestrictionType[] || ["ALL"]);
        setLoungeIds(user.suspension.loungeIds || []);
        setChannel(user.suspension.channel || "");
        setIncludeChannel(Boolean(user.suspension.channel && user.suspension.channel.trim().length > 0));
      } else {
        setReason("");
        setRestrictions(["ALL"]);
        setLoungeIds([]);
        setChannel("");
        setIncludeChannel(false);
      }
      setLoungeInput("");
      setError("");
    }
  }, [isOpen, user, isEditing]);

  const handleRestrictionChange = (restriction: RestrictionType, checked: boolean) => {
    if (restriction === "ALL") {
      if (checked) {
        setRestrictions(["ALL"]);
      } else {
        setRestrictions([]);
      }
    } else {
      let newRestrictions = restrictions.filter(r => r !== "ALL");
      if (checked) {
        newRestrictions = [...newRestrictions, restriction];
      } else {
        newRestrictions = newRestrictions.filter(r => r !== restriction);
      }
      setRestrictions(newRestrictions);
    }
  };

  const addLoungeId = () => {
    const trimmed = loungeInput.trim();
    if (trimmed && !loungeIds.includes(trimmed)) {
      setLoungeIds([...loungeIds, trimmed]);
      setLoungeInput("");
    }
  };

  const removeLoungeId = (id: string) => {
    setLoungeIds(loungeIds.filter(l => l !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (reason.trim().length < 3) {
      setError("Reason must be at least 3 characters long");
      return;
    }

    if (restrictions.includes("LOUNGES") && loungeIds.length === 0) {
      setError("At least one lounge ID is required when LOUNGES restriction is selected");
      return;
    }

    setError("");

    // Use external mutation if provided, otherwise fallback to internal logic
    if (onSuspendAction) {
      onSuspendAction({
        uid: user.uid,
        reason: reason.trim(),
        restrictions,
        ...(restrictions.includes("LOUNGES") && { loungeIds }),
        ...(includeChannel && channel.trim() && { channel: channel.trim() }),
      });
      return;
    }

    // Fallback internal logic
    setInternalLoading(true);
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/users/${user.uid}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          restrictions,
          ...(restrictions.includes("LOUNGES") && { loungeIds }),
          ...(includeChannel && channel.trim() && { channel: channel.trim() }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to suspend user");
      }

      onSuccessAction();
      onCloseAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend user");
    } finally {
      setInternalLoading(false);
    }
  };

  const handleUnsuspend = () => {
    if (!user || !onUnsuspendAction) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to unsuspend ${user.displayName || user.email}?`
    );
    
    if (confirmed) {
      onUnsuspendAction(user.uid);
    }
  };

  // Helper function to get ID token
  const getIdToken = async (): Promise<string> => {
    const { getIdToken } = await import("@/lib/firebase/auth");
    return await getIdToken();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-black/10 dark:border-white/10 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            {isEditing ? "Edit Suspension" : "Suspend User"}
          </h2>
          <button
            onClick={onCloseAction}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info */}
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
            <div className="font-medium text-black dark:text-white">
              {user.displayName || user.email || "Unknown User"}
            </div>
            <div className="text-sm text-black/60 dark:text-white/60">{user.email || "No email"}</div>
            <div className="text-xs text-black/40 dark:text-white/40">{user.uid}</div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Reason for Suspension *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none resize-none"
              placeholder="Enter reason for suspension..."
              rows={3}
              disabled={loading}
              required
            />
          </div>

          {/* Channel */}
          {includeChannel && (
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Channel
              </label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
                placeholder="e.g., web, mobile, support, moderation"
                disabled={loading}
              />
            </div>
          )}

          {/* Restrictions */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Restrictions
            </label>
            <div className="space-y-2">
              {(["ALL", "CHAT", "LOUNGES"] as RestrictionType[]).map((restriction) => (
                <label key={restriction} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={restrictions.includes(restriction)}
                    onChange={(e) => handleRestrictionChange(restriction, e.target.checked)}
                    disabled={loading || (restriction !== "ALL" && restrictions.includes("ALL"))}
                    className="rounded border-black/20 dark:border-white/20"
                  />
                  <span className="text-sm text-black dark:text-white">{restriction}</span>
                  {restriction === "ALL" && (
                    <Badge variant="red">Complete Suspension</Badge>
                  )}
                </label>
              ))}
              {/* Include Channel toggle */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeChannel}
                  onChange={(e) => setIncludeChannel(e.target.checked)}
                  disabled={loading}
                  className="rounded border-black/20 dark:border-white/20"
                />
                <span className="text-sm text-black dark:text-white">CHANNEL</span>
              </label>
            </div>
          </div>

          {/* Lounge IDs - only show if LOUNGES is selected */}
          {restrictions.includes("LOUNGES") && (
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Lounge IDs *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={loungeInput}
                  onChange={(e) => setLoungeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLoungeId())}
                  className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
                  placeholder="Enter lounge ID and press Enter"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addLoungeId}
                  className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              {loungeIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {loungeIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {id}
                      <button
                        type="button"
                        onClick={() => removeLoungeId(id)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCloseAction}
              className="flex-1 px-4 py-2 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            {isEditing && onUnsuspendAction && (
              <button
                type="button"
                onClick={handleUnsuspend}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Unsuspending..." : "Unsuspend"}
              </button>
            )}
            
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : isEditing ? "Update Suspension" : "Suspend User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
