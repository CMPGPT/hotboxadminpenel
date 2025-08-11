type Segment = {
  label: string;
  value: string | number;
  growth: string; // +18%
  color?: string; // for number accent
};

export default function UserSegments({ title, subtitle, segments }: { title: string; subtitle?: string; segments: Segment[] }) {
  return (
    <div className="card card-padding">
      <div className="mb-2 flex items-center gap-2 text-black/80 dark:text-white/80">
        <span>👥</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {subtitle ? <p className="text-sm text-black/60 dark:text-white/60 mb-4">{subtitle}</p> : null}

      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-lg border border-black/5 dark:border-white/10 px-3 py-3">
            <div>
              <div className="text-sm text-black/70 dark:text-white/70">{s.label}</div>
              <div className="text-2xl font-semibold" style={{ color: s.color ?? "inherit" }}>{s.value}</div>
            </div>
            <span className="text-xs inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">{s.growth}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


