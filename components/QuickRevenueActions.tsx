import Link from "next/link";
import { Download, Users, TrendingUp } from "lucide-react";

type Action = {
  title: string;
  description: string;
  href?: string;
  icon: React.ComponentType<{ size?: number }>;
};

const defaultActions: Action[] = [
  { title: "Export Revenue Report", description: "Download monthly report", href: "#", icon: Download },
  { title: "User Analytics", description: "Detailed user insights", href: "#", icon: Users },
  { title: "Growth Projections", description: "Future revenue forecasts", href: "#", icon: TrendingUp },
];

export default function QuickRevenueActions({ actions = defaultActions }: { actions?: Action[] }) {
  return (
    <div className="card card-padding">
      <div>
        <h3 className="text-lg font-semibold">Quick Revenue Actions</h3>
        <p className="text-sm text-black/60 dark:text-white/60">Fast access to common revenue management tasks</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map(({ title, description, icon: Icon, href }) => (
          <Link
            key={title}
            href={href ?? "#"}
            className="flex items-center gap-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/[.02] dark:bg-white/[.03] px-4 py-4 hover:bg-black/[.04] dark:hover:bg-white/[.05] transition"
          >
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-orange-50 text-[var(--primary)]">
              <Icon size={18} />
            </span>
            <span>
              <div className="font-medium">{title}</div>
              <div className="text-sm text-black/60 dark:text-white/60">{description}</div>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}


