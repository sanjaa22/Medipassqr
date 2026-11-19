import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <a href="/#how" className="btn-ghost">Хэрхэн ажилладаг</a>
          <a href="/#features" className="btn-ghost">Боломжууд</a>
          <a href="/#privacy" className="btn-ghost">Нууцлал</a>
          <a href="/#faq" className="btn-ghost">Түгээмэл асуулт</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="btn-primary">Миний карт</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Нэвтрэх</Link>
              <Link href="/register" className="btn-primary">Эхлэх</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
