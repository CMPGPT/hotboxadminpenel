"use client";
import AppShell from "@/components/AppShell";
import ReportsTable from "@/components/ReportsTable";
import RequireAuth from "@/components/RequireAuth";

export default function ReportsPage() {
  const rows = [
    { id: "RPT-001", reporter: "hemp_buyer_23", reportedUser: "kratom_seller_89", type: "Lounge" as const, category: "Harassment", priority: "High" as const, status: "Pending" as const, date: "2024-01-15" },
    { id: "RPT-002", reporter: "wholesale_vendor_45", reportedUser: "bulk_trader_67", type: "Lounge" as const, category: "Spam", priority: "Medium" as const, status: "Under Review" as const, date: "2024-01-14" },
    { id: "RPT-003", reporter: "retailer_shop_12", reportedUser: "kratom_distributor_34", type: "Inbox" as const, category: "Fraud", priority: "Critical" as const, status: "Resolved" as const, date: "2024-01-12" },
    { id: "RPT-004", reporter: "verified_buyer_78", reportedUser: "hemp_enthusiast_90", type: "Lounge" as const, category: "Inappropriate Content", priority: "Low" as const, status: "Dismissed" as const, date: "2024-01-10" },
    { id: "RPT-005", reporter: "bulk_seller_56", reportedUser: "retail_network_23", type: "Inbox" as const, category: "Other", priority: "Low" as const, status: "Pending" as const, date: "2024-01-20" },
  ];

  return (
    <RequireAuth>
      <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Total Reports</div><div className="text-3xl font-semibold mt-1">5</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Pending Review</div><div className="text-3xl font-semibold mt-1">2</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Under Review</div><div className="text-3xl font-semibold mt-1">1</div></div>
          <div className="card card-padding"><div className="text-sm text-black/60 dark:text-white/60">Critical Priority</div><div className="text-3xl font-semibold mt-1">1</div></div>
        </div>

        <div className="card card-padding">
          <h1 className="text-xl font-semibold">Reports Management</h1>
          <p className="text-sm text-black/60 dark:text-white/60">Review and manage all user reports from inbox and lounge</p>
          <div className="mt-4 flex items-center gap-3">
            <input placeholder="Search reports by ID, user, or category..." className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 outline-none" />
            <button className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2">Export Reports</button>
          </div>
        </div>

        <ReportsTable rows={rows} />

        <div className="card card-padding">
          <h2 className="text-lg font-semibold">Recent Report Details</h2>
          <p className="text-sm text-black/60 dark:text-white/60">Quick overview of the most recent reports</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-black/5">RPT-001</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Lounge</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">High</span>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Pending</span>
              </div>
              <div className="border-t border-black/10 dark:border-white/10 p-3 text-sm">
                <div className="font-medium mb-1">Harassment</div>
                <p className="text-black/70 dark:text-white/70">User posting aggressive comments about competitor products in Talk N&apos; Toke</p>
                <div className="mt-2 grid grid-cols-2">
                  <span className="text-black/60 dark:text-white/60">Reporter: hemp_buyer_23</span>
                  <span className="text-black/60 dark:text-white/60">Reported: kratom_seller_89</span>
                </div>
                <div className="text-black/60 dark:text-white/60 mt-1">Date: 2024-01-15</div>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-black/5">RPT-002</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Lounge</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Medium</span>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Under Review</span>
              </div>
              <div className="border-t border-black/10 dark:border-white/10 p-3 text-sm">
                <div className="font-medium mb-1">Spam</div>
                <p className="text-black/70 dark:text-white/70">Posting promotional wholesale links repeatedly in VIP Lounge</p>
                <div className="mt-2 grid grid-cols-2">
                  <span className="text-black/60 dark:text-white/60">Reporter: wholesale_vendor_45</span>
                  <span className="text-black/60 dark:text-white/60">Reported: bulk_trader_67</span>
                </div>
                <div className="text-black/60 dark:text-white/60 mt-1">Date: 2024-01-14</div>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-black/5">RPT-003</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-black/10">Inbox</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Critical</span>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Resolved</span>
              </div>
              <div className="border-t border-black/10 dark:border-white/10 p-3 text-sm">
                <div className="font-medium mb-1">Fraud</div>
                <p className="text-black/70 dark:text-white/70">Attempting to sell unverified kratom products with false lab results</p>
                <div className="mt-2 grid grid-cols-2">
                  <span className="text-black/60 dark:text-white/60">Reporter: retailer_shop_12</span>
                  <span className="text-black/60 dark:text-white/60">Reported: kratom_distributor_34</span>
                </div>
                <div className="text-black/60 dark:text-white/60 mt-1">Date: 2024-01-12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AppShell>
    </RequireAuth>
  );
}


