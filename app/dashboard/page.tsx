"use client";
import AppShell from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { StatCard } from "@/components/StatCard";
import PlanBreakdown from "@/components/PlanBreakdown";
import ActivityList from "@/components/ActivityList";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalProducts: number; newProducts7d: number; newUsers7d: number; newSubscriptions7d: number } | null>(null);
  const [plans, setPlans] = useState<{ total: number; items: { name: string; count: number }[] } | null>(null);
  const [activity, setActivity] = useState<{ items: { title: string; time: string; iconColor: string }[] } | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard/overview");
        const json = await res.json();
        if (!ignore) {
          if (res.ok) setStats(json);
          else setError(json?.error || "Failed to load dashboard");
        }
      } catch {
        if (!ignore) setError("Failed to load dashboard");
      } finally {
        if (!ignore) setLoading(false);
      }
      try {
        const r2 = await fetch("/api/dashboard/plans");
        const j2 = await r2.json();
        if (!ignore && r2.ok) setPlans(j2);
      } catch {}
      try {
        const r3 = await fetch("/api/dashboard/activity");
        const j3 = await r3.json();
        if (!ignore && r3.ok) setActivity(j3);
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <RequireAuth>
      <AppShell>
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="New Subscriptions (7d)" value={stats?.newSubscriptions7d ?? (loading ? 0 : 0)} sublabel="Activated in last 7 days" />
          <StatCard title="New Users (7d)" value={stats?.newUsers7d ?? (loading ? 0 : 0)} sublabel="Created in last 7 days" />
          <StatCard title="Total Products" value={stats?.totalProducts ?? (loading ? 0 : 0)} sublabel="All-time catalog size" />
          <StatCard title="New Products (7d)" value={stats?.newProducts7d ?? (loading ? 0 : 0)} sublabel="Added in last 7 days" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PlanBreakdown
            plans={(plans?.items || []).map((p, idx) => ({
              name: p.name,
              value: p.count,
              color: ["#FF8400", "#10b981", "#f59e0b", "#3b82f6", "#94a3b8"][idx % 5],
              percent: plans && plans.total > 0 ? `${((p.count / plans.total) * 100).toFixed(1)}%` : "0%",
            }))}
          />
          <ActivityList items={activity?.items || []} />
        </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}


