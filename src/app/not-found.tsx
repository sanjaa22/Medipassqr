import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <LogoMark className="h-14 w-14" />
      <p className="mt-6 text-6xl font-black text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold">Хуудас олдсонгүй</h1>
      <p className="mt-2 text-slate-500">Таны хайсан хуудас байхгүй эсвэл шилжсэн байна.</p>
      <Link href="/" className="btn-primary mt-6">Нүүр хуудас</Link>
    </div>
  );
}
