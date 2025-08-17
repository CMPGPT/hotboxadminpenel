"use client";
import Link from "next/link";
import { BarChart3, LineChart, Users, FileWarning } from "lucide-react";
import { usePathname } from "next/navigation";

type TabItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  isExternal?: boolean;
};

const tabs: TabItem[] = [
  { href: "/dashboard", label: "Analytics", Icon: BarChart3 },
  { href: "/revenue", label: "Revenue & Users", Icon: LineChart },
  { href: "/users", label: "User Management", Icon: Users },
  // { href: "/reports", label: "Reports", Icon: FileWarning }, // temporarily hidden per request
];

export default function PageTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-black/5 dark:border-white/10 bg-white">
      <div className="container-responsive">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {tabs.map(({ href, label, Icon }) => {
            const isActive = pathname === "/dashboard" ? href === "/dashboard" : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  isActive
                    ? "text-[var(--primary)] border-[var(--primary)] bg-transparent"
                    : "text-black border-transparent hover:bg-black/[.05]"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


