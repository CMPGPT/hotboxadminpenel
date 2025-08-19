"use client";
import AppShell from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import UsersTable from "@/components/admin/users/UsersTable";
import SuspendedUsersTable from "@/components/admin/users/SuspendedUsersTable";
import SuspendUserModal from "@/components/admin/users/SuspendUserModal";
import DeleteUserConfirm from "@/components/admin/users/DeleteUserConfirm";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

type FilterType = {
  userType: 'all' | 'buyer' | 'seller' | 'admin';
  status: 'all' | 'active' | 'suspended' | 'inactive';
  subscription: 'all' | 'free' | 'wholesaler' | 'retailer';
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterType>({
    userType: 'all',
    status: 'all', 
    subscription: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [suspendModalUser, setSuspendModalUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Fetch users with TanStack Query
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch("/api/users/list");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load users");
      }
      return Array.isArray(data.users) ? data.users : [];
    },
    staleTime: 1000 * 30, // 30 seconds - shorter stale time for more frequent updates
    refetchInterval: 1000 * 60, // Refetch every minute to catch suspension changes
  });

  // Mutations for user actions
  const deleteMutation = useMutation({
    mutationFn: async (uid: string) => {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const response = await fetch(`/api/users/${uid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteModalUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ uid, reason, restrictions, loungeIds, channel }: {
      uid: string;
      reason: string;
      restrictions: string[];
      loungeIds?: string[];
      channel?: string;
    }) => {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      
      // Debug: Log token payload to understand actor email issue
      console.log('Frontend: Sending suspend request with token');
      
      const response = await fetch(`/api/users/${uid}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ reason, restrictions, ...(loungeIds && { loungeIds }), ...(channel && { channel }) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to suspend user");
      return data;
    },
    onSuccess: (data, variables) => {
      // Force refresh to ensure UI reflects the suspended state
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      toast.success(`User ${variables.uid} suspended successfully`);
      setSuspendModalUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suspend user');
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: async (uid: string) => {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const response = await fetch(`/api/users/${uid}/unsuspend`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to unsuspend user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User unsuspended successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unsuspend user');
    },
  });

  const filtered = useMemo(() => {
    let result = users;
    
    // Apply search filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((u: User) => {
        const email = (u.email || "").toLowerCase();
        const name = (u.displayName || "").toLowerCase();
        const userType = (u.userType || "").toLowerCase();
        const sellerType = (u.sellerType || "").toLowerCase();
        const uid = u.uid.toLowerCase();
        return (
          email.includes(q) ||
          name.includes(q) ||
          userType.includes(q) ||
          sellerType.includes(q) ||
          uid.includes(q)
        );
      });
    }
    
    // Apply user type filter
    if (filters.userType !== 'all') {
      result = result.filter((u: User) => {
        if (filters.userType === 'buyer') return u.userType === 'buyer' || (!u.userType && !u.admin);
        if (filters.userType === 'seller') return u.sellerType && u.sellerType !== 'Free';
        if (filters.userType === 'admin') return u.admin;
        return true;
      });
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter((u: User) => {
        if (filters.status === 'suspended') return u.suspension?.active;
        if (filters.status === 'inactive') return u.disabled;
        if (filters.status === 'active') return !u.disabled && !u.suspension?.active;
        return true;
      });
    }
    
    // Apply subscription filter
    if (filters.subscription !== 'all') {
      result = result.filter((u: User) => {
        const subscription = (u.sellerType || 'Free').toLowerCase();
        return subscription === filters.subscription;
      });
    }
    
    return result;
  }, [users, search, filters]);

  const suspendedUsers = useMemo(() => {
    return users.filter((u: User) => u.suspension?.active).map((u: User) => ({
      ...u,
      suspension: u.suspension!,
      email: u.email || "unknown@example.com"
    }));
  }, [users]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u: User) => !u.disabled && !u.suspension?.active).length;
    const suspended = users.filter((u: User) => u.suspension?.active).length;
    const inactive = users.filter((u: User) => u.disabled).length;
    return { total, active, suspended, inactive };
  }, [users]);

  const handleRefreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleSuspendUser = (user: User) => {
    setSuspendModalUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModalUser(user);
  };

  const handleSuspendSuccess = () => {
    // Handled by mutation
  };

  const handleDeleteSuccess = () => {
    // Handled by mutation
  };

  const handleUnsuspendUser = (uid: string) => {
    unsuspendMutation.mutate(uid);
  };

  const handleEditSuspension = (user: any) => {
    setSuspendModalUser(user);
  };

  return (
    <RequireAuth>
      <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card card-padding">
            <div className="text-sm text-black/60 dark:text-white/60">Total Users</div>
            <div className="text-3xl font-semibold mt-1">{stats.total}</div>
          </div>
          <div className="card card-padding">
            <div className="text-sm text-black/60 dark:text-white/60">Active Users</div>
            <div className="text-3xl font-semibold mt-1">{stats.active}</div>
          </div>
          <div className="card card-padding">
            <div className="text-sm text-black/60 dark:text-white/60">Suspended Users</div>
            <div className="text-3xl font-semibold mt-1">{stats.suspended}</div>
          </div>
          <div className="card card-padding">
            <div className="text-sm text-black/60 dark:text-white/60">Inactive Users</div>
            <div className="text-3xl font-semibold mt-1">{stats.inactive}</div>
          </div>
        </div>

        <div className="card card-padding">
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-black/60 dark:text-white/60">View, search, suspend, and delete platform users</p>
          
          {/* Search and Filter Controls */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                placeholder="Search by name, email, UID, user type, or seller type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showFilters
                  ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                  : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
              <button 
                onClick={handleRefreshUsers}
                className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-1">
                    User Type
                  </label>
                  <select
                    value={filters.userType}
                    onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value as any }))}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-1">
                    Subscription
                  </label>
                  <select
                    value={filters.subscription}
                    onChange={(e) => setFilters(prev => ({ ...prev, subscription: e.target.value as any }))}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="free">Free</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="card card-padding text-red-600 dark:text-red-400">{error.message}</div>
        ) : null}

        {/* Suspended Users Table */}
        {suspendedUsers.length > 0 && (
          <SuspendedUsersTable
            users={suspendedUsers}
            loading={isLoading}
            onEditSuspensionAction={handleEditSuspension}
            onUnsuspendAction={(user) => handleUnsuspendUser(user.uid)}
          />
        )}

        {/* All Users Table */}
        <UsersTable
          users={filtered}
          loading={isLoading}
          onSuspendUserAction={handleSuspendUser}
          onDeleteUserAction={handleDeleteUser}
        />

        {/* Modals */}
        <SuspendUserModal
          user={suspendModalUser}
          isOpen={!!suspendModalUser}
          onCloseAction={() => setSuspendModalUser(null)}
          onSuccessAction={handleSuspendSuccess}
          onSuspendAction={suspendMutation.mutate}
          onUnsuspendAction={(uid) => handleUnsuspendUser(uid)}
          loading={suspendMutation.isPending || unsuspendMutation.isPending}
        />

        <DeleteUserConfirm
          user={deleteModalUser}
          isOpen={!!deleteModalUser}
          onCloseAction={() => setDeleteModalUser(null)}
          onSuccessAction={handleDeleteSuccess}
          onDeleteAction={deleteMutation.mutate}
          loading={deleteMutation.isPending}
        />
      </div>
      </AppShell>
    </RequireAuth>
  );
}


