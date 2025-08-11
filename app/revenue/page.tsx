"use client";
import AppShell from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import BreakdownBarList from "@/components/BreakdownBarList";
import UserSegments from "@/components/UserSegments";
import QuickRevenueActions from "@/components/QuickRevenueActions";

export default function RevenuePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Monthly Revenue" value="$29,925" sublabel="From all subscriptions and transactions" growthLabel="+24%" />
          <StatCard title="Total Active Users" value={4530} sublabel="Currently active on platform" growthLabel="+12%" />
          <StatCard title="Average Revenue Per User" value="$14.28" sublabel="Monthly ARPU" growthLabel="+8%" />
          <StatCard title="User Growth Rate" value="15.3%" sublabel="Month over month" growthLabel="+3.2%" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <BreakdownBarList
            title="Revenue Breakdown"
            subtitle="Monthly revenue sources and distribution"
            items={[
              { label: "Bulk Seller ($49.99)", amount: "$7,799", percent: "45.2%", color: "#FF8400", progress: 45 },
              { label: "Retailer ($29.99)", amount: "$9,716", percent: "35.6%", color: "#10b981", progress: 36 },
              { label: "Buyer ($9.99)", amount: "$12,020", percent: "17.8%", color: "#f59e0b", progress: 18 },
              { label: "Premium Features", amount: "$390", percent: "1.4%", color: "#3b82f6", progress: 2 },
            ]}
          />

          <UserSegments
            title="User Segments"
            subtitle="Breakdown of active user categories"
            segments={[
              { label: "Bulk Sellers", value: 156, growth: "+18%", color: "#FF8400" },
              { label: "Retailers", value: 324, growth: "+15%", color: "#10b981" },
              { label: "Paid Buyers", value: 1203, growth: "+22%", color: "#f59e0b" },
              { label: "Free Users", value: 2847, growth: "+8%", color: "#3b82f6" },
            ]}
          />
        </div>

        <QuickRevenueActions />
      </div>
    </AppShell>
  );
}


