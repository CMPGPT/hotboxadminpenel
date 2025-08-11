import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  sublabel?: string;
  growthLabel?: string; // e.g. +23%
  icon?: ReactNode;
};

export function StatCard({ title, value, sublabel, growthLabel, icon }: StatCardProps) {
  return (
    <div className="card card-padding">
      <div className="flex items-center justify-between">
        <div className="text-sm text-black/70 dark:text-white/70 font-medium">{title}</div>
        {icon ? <div className="text-black/50 dark:text-white/50">{icon}</div> : null}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {growthLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/></svg>
            {growthLabel}
          </span>
        ) : null}
        {sublabel ? <span className="text-black/60 dark:text-white/60">{sublabel}</span> : null}
      </div>
    </div>
  );
}


