"use client";
import PageTabs from "@/components/PageTabs";
import AuthSignOutButton from "@/components/AuthSignOutButton";

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-gradient-to-r from-[var(--primary)] to-orange-400 text-white">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">HotBox Super Admin Panel</h1>
              <p className="text-white/90 text-sm">Complete management dashboard for your platform</p>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Administrator</span>
              <AuthSignOutButton />
            </div>
          </div>
        </div>
      </div>

      <PageTabs />

      <main className="container-responsive py-4 sm:py-6 flex-1">{children}</main>
    </div>
  );
}


