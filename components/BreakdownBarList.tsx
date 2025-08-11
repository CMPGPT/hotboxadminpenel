type BreakdownItem = {
  label: string;
  amount: string; // formatted currency string
  percent: string; // formatted like 52.7%
  color: string; // bar color
  progress: number; // 0-100
};

export default function BreakdownBarList({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: BreakdownItem[];
}) {
  return (
    <div className="card card-padding">
      <div className="mb-2 flex items-center gap-2 text-black/80 dark:text-white/80">
        <span>$</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {subtitle ? (
        <p className="text-sm text-black/60 dark:text-white/60 mb-4">{subtitle}</p>
      ) : null}

      <div className="space-y-5">
        {items.map((it) => (
          <div key={it.label} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-black/80 dark:text-white/80">{it.label}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold tabular-nums">{it.amount}</div>
                <span className="text-xs rounded-full bg-black/[.06] dark:bg-white/[.08] px-2 py-0.5 text-black/70 dark:text-white/70">{it.percent}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-black/[.06] dark:bg-white/[.08] overflow-hidden">
              <div className="h-full" style={{ width: `${Math.min(Math.max(it.progress, 0), 100)}%`, backgroundColor: it.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


