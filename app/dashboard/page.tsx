"use client";
import AppShell from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import PlanBreakdown from "@/components/PlanBreakdown";
import ActivityList from "@/components/ActivityList";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Products Added" value={1247} sublabel="This month" growthLabel="+23%" />
          <StatCard title="Buy Now Clicks" value={15824} sublabel="Click-through rate: 12.3%" growthLabel="+18%" />
          <StatCard title="Seller Subscriptions" value={892} sublabel="Active seller plans" growthLabel="+15%" />
          <StatCard title="Buyer Subscriptions" value={2156} sublabel="Active buyer plans" growthLabel="+8%" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PlanBreakdown
            plans={[
              { name: "Basic Seller", value: 324, color: "#FF8400", percent: "10.6%" },
              { name: "Pro Seller", value: 412, color: "#10b981", percent: "13.5%" },
              { name: "Enterprise Seller", value: 156, color: "#f59e0b", percent: "5.1%" },
              { name: "Buyer Premium", value: 1203, color: "#3b82f6", percent: "39.5%" },
              { name: "Buyer Standard", value: 953, color: "#e5e7eb", percent: "31.3%" },
            ]}
          />
          <ActivityList
            items={[
              { iconColor: "#10b981", title: "New product listing created", time: "2 min ago" },
              { iconColor: "#f59e0b", title: "User upgraded to Pro plan", time: "5 min ago" },
              { iconColor: "#3b82f6", title: "Report submitted", time: "12 min ago" },
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}


