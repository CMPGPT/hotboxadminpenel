type Activity = { iconColor: string; title: string; time: string };

export default function ActivityList({ items }: { items: Activity[] }) {
  return (
    <div className="card card-padding">
      <div className="mb-2 flex items-center gap-2 text-black/80 dark:text-white/80">
        <span>📝</span>
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60 mb-4">Latest platform activities</p>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg bg-black/[.03] dark:bg-white/[.04] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.iconColor }} />
              <span className="text-sm">{it.title}</span>
            </div>
            <span className="text-xs text-black/60 dark:text-white/60">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


