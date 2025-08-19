"use client";
import { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteUserConfirmProps {
  user: {
    uid: string;
    email: string | null;
    displayName?: string | null;
  } | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
  onDeleteAction?: (uid: string) => void;
  loading?: boolean;
}

export default function DeleteUserConfirm({ 
  user, 
  isOpen, 
  onCloseAction, 
  onSuccessAction, 
  onDeleteAction,
  loading: externalLoading = false
}: DeleteUserConfirmProps) {
  const [confirmText, setConfirmText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;
  const [error, setError] = useState("");

  const isConfirmValid = user && (confirmText === user.email || confirmText === user.uid);
  const canDelete = isConfirmValid && understood && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canDelete) return;

    setError("");

    // Use external mutation if provided, otherwise fallback to internal logic
    if (onDeleteAction) {
      onDeleteAction(user.uid);
      return;
    }

    // Fallback internal logic
    setInternalLoading(true);
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/users/${user.uid}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      onSuccessAction();
      onCloseAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setInternalLoading(false);
    }
  };

  // Helper function to get ID token
  const getIdToken = async (): Promise<string> => {
    const { getIdToken } = await import("@/lib/firebase/auth");
    return await getIdToken();
  };

  const handleClose = () => {
    setConfirmText("");
    setUnderstood(false);
    setError("");
    onCloseAction();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-black/10 dark:border-white/10 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Delete User
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                This action cannot be undone
              </div>
              <div className="text-red-700 dark:text-red-300">
                This will permanently delete the user account, remove all their data from the platform,
                and revoke their access. All user-generated content, messages, and files will be permanently removed.
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
            <div className="font-medium text-black dark:text-white">
              {user.displayName || user.email || "Unknown User"}
            </div>
            <div className="text-sm text-black/60 dark:text-white/60">{user.email || "No email"}</div>
            <div className="text-xs text-black/40 dark:text-white/40">{user.uid}</div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Type the user's email or UID to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
              placeholder={`Enter "${user.email}" or "${user.uid}"`}
              disabled={loading}
            />
            {confirmText && !isConfirmValid && (
              <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                Text does not match the user's email or UID
              </div>
            )}
          </div>

          {/* Understanding Checkbox */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              disabled={loading}
              className="rounded border-black/20 dark:border-white/20 mt-0.5"
            />
            <span className="text-sm text-black dark:text-white">
              I understand that this action is permanent and will completely remove all user data from the platform.
            </span>
          </label>

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
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canDelete}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete User Permanently"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
