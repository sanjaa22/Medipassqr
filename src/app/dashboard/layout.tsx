import { requireUser } from "@/lib/auth";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import DashNav from "./DashNav";
import { logoutAction } from "../actions/auth";
import { IconLogout } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="no-print border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/dashboard" />
          <div className="lg:hidden"><ThemeToggle /></div>
        </div>
        <DashNav />
        <div className="mt-auto hidden border-t border-slate-200 p-4 dark:border-slate-800 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <form action={logoutAction} className="mt-3">
            <button className="btn-secondary w-full"><IconLogout className="h-4 w-4" /> Гарах</button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
