import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { logoutAllAction } from "@/app/actions/dashboard";
import { SettingsForms, DeleteAccount } from "./SettingsForms";
import { IconDownload } from "@/components/Icons";

export const metadata = { title: "Бүртгэлийн тохиргоо" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Бүртгэлийн тохиргоо" desc={`${user.email} · Бүртгүүлсэн: ${fmtDate(user.createdAt)}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsForms name={user.name} />
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="h-section">Сешн</h2>
            <p className="mt-1 text-sm text-slate-500">Утас, компьютер алдсан бол бүх төхөөрөмжөөс нэг дор гаргана.</p>
            <form action={logoutAllAction} className="mt-4"><button className="btn-secondary w-full">Бүх төхөөрөмжөөс гарах</button></form>
          </div>
          <div className="card p-6">
            <h2 className="h-section">Өгөгдлөө татаж авах</h2>
            <p className="mt-1 text-sm text-slate-500">Таны бүх мэдээлэл, тохиргоо, хандалтын түүхийг JSON файлаар татна (өгөгдөл зөөвөрлөх эрх).</p>
            <a href="/api/export" className="btn-secondary mt-4 w-full"><IconDownload className="h-4 w-4" /> JSON татах</a>
          </div>
          <DeleteAccount />
        </div>
      </div>
    </>
  );
}
