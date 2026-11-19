"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconUser, IconShield, IconQr, IconList, IconSettings } from "@/components/Icons";

const items = [
  { href: "/dashboard", label: "Хяналтын самбар", icon: IconHome },
  { href: "/dashboard/profile", label: "Эрүүл мэндийн мэдээлэл", icon: IconUser },
  { href: "/dashboard/privacy", label: "Нууцлал ба PIN", icon: IconShield },
  { href: "/dashboard/qr", label: "QR код ба карт", icon: IconQr },
  { href: "/dashboard/logs", label: "Хандалтын түүх", icon: IconList },
  { href: "/dashboard/settings", label: "Бүртгэлийн тохиргоо", icon: IconSettings },
];

export default function DashNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map(({ href, label, icon: I }) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
            <I className="h-5 w-5" /><span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
