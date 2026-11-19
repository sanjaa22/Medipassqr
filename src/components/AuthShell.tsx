import Logo from "./Logo";
import { IconShield, IconQr, IconLock } from "./Icons";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-rose-900 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-40 left-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="relative space-y-6">
          <p className="text-3xl font-bold leading-tight">“Яаралтай үед эхний минутууд амь насыг шийддэг.”</p>
          <ul className="space-y-3 text-white/90">
            <li className="flex gap-3"><IconQr /> Нэг QR код — бүх чухал мэдээлэл</li>
            <li className="flex gap-3"><IconShield /> AES-256 шифрлэлттэй хадгалалт</li>
            <li className="flex gap-3"><IconLock /> Талбар бүрийн нууцлалыг та шийднэ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
