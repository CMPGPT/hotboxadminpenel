"use client";
import AppShell from "@/components/AppShell";
import UserTable from "@/components/UserTable";

export default function UsersPage() {
  const rows = [
    {
      initials: "JS",
      name: "John Smith",
      email: "john.smith@email.com",
      type: "Seller" as const,
      status: "Active" as const,
      subscription: "Pro Seller",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
    },
    {
      initials: "SJ",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      type: "Buyer" as const,
      status: "Active" as const,
      subscription: "Premium Buyer",
      joinDate: "2024-02-10",
      lastActive: "1 day ago",
    },
    {
      initials: "MW",
      name: "Mike Wilson",
      email: "m.wilson@email.com",
      type: "Seller" as const,
      status: "Suspended" as const,
      subscription: "Basic Seller",
      joinDate: "2024-01-28",
      lastActive: "1 week ago",
    },
    {
      initials: "ED",
      name: "Emma Davis",
      email: "emma.davis@email.com",
      type: "Buyer" as const,
      status: "Active" as const,
      subscription: "Standard Buyer",
      joinDate: "2024-03-05",
      lastActive: "30 min ago",
    },
    {
      initials: "RB",
      name: "Robert Brown",
      email: "rob.brown@email.com",
      type: "Seller" as const,
      status: "Inactive" as const,
      subscription: "Enterprise Seller",
      joinDate: "2023-12-20",
      lastActive: "3 weeks ago",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Total Users</div><div className="text-3xl font-semibold mt-1">5</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Active Users</div><div className="text-3xl font-semibold mt-1">3</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Suspended Users</div><div className="text-3xl font-semibold mt-1">1</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Sellers</div><div className="text-3xl font-semibold mt-1">3</div></div>
        </div>

        <div className="card card-padding">
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-black/60 dark:text-white/60">View, search, and manage all platform users</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              placeholder="Search users by name or email..."
              className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none"
            />
            <button className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2">Export Users</button>
          </div>
        </div>

        <UserTable rows={rows} />
      </div>
    </AppShell>
  );
}


