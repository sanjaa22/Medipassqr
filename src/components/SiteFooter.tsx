import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            MediPass нь яаралтай үед таны амь насыг аврах мэдээллийг зөв хүнд, зөв цагт хүргэх QR карт юм.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-600">Түргэн тусламж: 103 · Онцгой байдал: 105 · Цагдаа: 102</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Үйлчилгээ</p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li><Link href="/register" className="hover:text-brand-600">Бүртгүүлэх</Link></li>
            <li><Link href="/login" className="hover:text-brand-600">Нэвтрэх</Link></li>
            <li><a href="/#faq" className="hover:text-brand-600">Түгээмэл асуулт</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Эрх зүй</p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li><Link href="/privacy" className="hover:text-brand-600">Нууцлалын бодлого</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">Үйлчилгээний нөхцөл</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} MediPass. Үйлдвэрлэлийн дадлагын төсөл. MediPass нь эмнэлгийн тусламжийг орлохгүй.
      </div>
    </footer>
  );
}
