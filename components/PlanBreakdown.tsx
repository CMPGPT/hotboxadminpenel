type Plan = { name: string; value: number; color: string; percent: string };

export default function PlanBreakdown({ plans }: { plans: Plan[] }) {
  return (
    <div className="card card-padding">
      <div className="mb-2 flex items-center gap-2 text-black/80 dark:text-white/80">
        <span>🎧</span>
        <h3 className="font-semibold">Subscription Plans Breakdown</h3>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60 mb-4">Distribution of active subscription plans</p>
      <div className="space-y-4">
        {plans.map((p) => (
          <div key={p.name} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-sm">{p.name}</span>
            <span className="text-sm font-medium tabular-nums">{p.value}</span>
            <span className="text-xs text-black/60 dark:text-white/60">{p.percent}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


