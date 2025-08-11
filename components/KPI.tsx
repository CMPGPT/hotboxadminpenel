type KPIProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function KPI({ label, value, hint }: KPIProps) {
  return (
    <div className="card card-padding">
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-black/50 dark:text-white/50">{hint}</div>
      ) : null}
    </div>
  );
}


