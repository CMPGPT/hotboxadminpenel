"use client";
import AppShell from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import BreakdownBarList from "@/components/BreakdownBarList";
import UserSegments from "@/components/UserSegments";
import QuickRevenueActions from "@/components/QuickRevenueActions";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useMemo, useState } from "react";

function formatCurrencyCents(cents: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format((cents || 0) / 100);
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<null | {
    totalMonthlyRevenueCents: number;
    activeSubscriptions: number;
    arpuCents: number;
    breakdown: { key: string; label: string; amountCents: number; percent: number; color: string }[];
    segments: { wholesalers: number; retailers: number; paidBuyers: number; others: number; paidUsers: number; basicUsers: number };
  }>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/revenue/overview");
        const json = await res.json();
        if (res.ok && !ignore) setData(json);
        else if (!ignore) setError(json?.error || "Failed to load revenue");
      } catch {
        if (!ignore) setError("Failed to load revenue");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const breakdownItems = useMemo(() => {
    if (!data) return [] as { label: string; amount: string; percent: string; color: string; progress: number }[];
    return data.breakdown.map((b) => ({
      label: `${b.label}`,
      amount: formatCurrencyCents(b.amountCents),
      percent: `${b.percent.toFixed(1)}%`,
      color: b.color,
      progress: b.percent,
    }));
  }, [data]);

  return (
    <RequireAuth>
      <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Monthly Revenue" value={data ? formatCurrencyCents(data.totalMonthlyRevenueCents) : (loading ? "…" : "$0.00")} sublabel="From active subscriptions" />
          <StatCard title="Active Subscriptions" value={data ? data.activeSubscriptions : (loading ? 0 : 0)} sublabel="Count of active subs" />
          <StatCard title="Average Revenue Per User" value={data ? formatCurrencyCents(data.arpuCents) : (loading ? "…" : "$0.00")} sublabel="Monthly ARPU" />
          <StatCard title="Data Status" value={loading ? "Loading" : (error ? "Error" : "Up-to-date")} sublabel={error || "Subscription dataset"} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <BreakdownBarList
            title="Revenue Breakdown"
            subtitle="Monthly revenue sources (wholesaler, retailer, paid buyer, other)"
            items={breakdownItems}
          />

          <UserSegments
            title="Subscription Segments"
            subtitle="Active subscribers by category and user base split"
            segments={[
              { label: "Wholesalers", value: data?.segments.wholesalers || 0, growth: "", color: "#FF8400" },
              { label: "Retailers", value: data?.segments.retailers || 0, growth: "", color: "#10b981" },
              { label: "Paid Buyers", value: data?.segments.paidBuyers || 0, growth: "", color: "#f59e0b" },
              { label: "Other", value: data?.segments.others || 0, growth: "", color: "#3b82f6" },
              { label: "Paid Users (unique)", value: data?.segments.paidUsers || 0, growth: "", color: "#8b5cf6" },
              { label: "Basic Users", value: data?.segments.basicUsers || 0, growth: "", color: "#94a3b8" },
            ]}
          />
        </div>

        <QuickRevenueActions />
        {error ? (
          <div className="card card-padding text-red-600 dark:text-red-400">{error}</div>
        ) : null}
      </div>
      </AppShell>
    </RequireAuth>
  );
}


