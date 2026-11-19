import Link from "next/link";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureCard, cardUrl } from "@/lib/card";
import { getMedical, completeness } from "@/lib/profile";
import { normalizeVisibility } from "@/lib/fields";
import { describeUserAgent } from "@/lib/request";
import PageHeader from "@/components/PageHeader";
import { IconQr, IconEye, IconLock, IconShield, IconAlert, IconCheck, IconUser } from "@/components/Icons";
import { fmtDateTime, relTime } from "@/lib/format";

import { EV } from "@/components/EventBadge";

export default async function Dashboard() {
  const user = await requireUser();
  const [card, med] = await Promise.all([ensureCard(user.id), getMedical(user.id)]);
  const vis = normalizeVisibility(card.visibility);
  const since = new Date(Date.now() - 30 * 86400000);
  const [views30, pinOk, lastLogs] = await Promise.all([
    prisma.accessLog.count({ where: { cardId: card.id, event: "view", createdAt: { gte: since } } }),
    prisma.accessLog.count({ where: { cardId: card.id, event: "pin_ok", createdAt: { gte: since } } }),
    prisma.accessLog.findMany({ where: { cardId: card.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const url = await cardUrl(card.token);
  const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: "H", margin: 1, width: 360, color: { dark: "#0f172a", light: "#ffffff" } });
  const pct = completeness(med);
  const counts = Object.values(vis).reduce((a, v) => ({ ...a, [v]: (a[v] ?? 0) + 1 }), {} as Record<string, number>);

  const tasks = [
    { done: !!med.bloodType, label: "Цусны бүлгээ оруулах", href: "/dashboard/profile" },
    { done: med.contacts.length > 0, label: "Яаралтай холбоо барих хүн нэмэх", href: "/dashboard/profile" },
    { done: !!med.allergies, label: "Харшлын мэдээлэл оруулах (байхгүй бол “Байхгүй”)", href: "/dashboard/profile" },
    { done: !!card.pinHash, label: "PIN код тохируулах", href: "/dashboard/privacy" },
    { done: views30 > 0, label: "QR кодоо өөрөө уншуулж шалгах", href: "/dashboard/qr" },
  ];

  return (
    <>
      <PageHeader title={`Сайн байна уу, ${user.name}!`} desc="Таны яаралтай тусламжийн картын ерөнхий төлөв.">
        <Link href="/dashboard/qr" className="btn-primary"><IconQr className="h-4 w-4" /> QR код харах</Link>
      </PageHeader>

      {!card.active && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <IconAlert /> Таны карт одоогоор <b>идэвхгүй</b> байна. QR уншуулахад мэдээлэл харагдахгүй.
          <Link href="/dashboard/privacy" className="ml-auto font-semibold underline">Идэвхжүүлэх</Link>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<IconUser />} label="Профайлын бүрэн байдал" value={`${pct}%`}>
          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div>
        </Stat>
        <Stat icon={<IconEye />} label="Сүүлийн 30 хоногт үзсэн" value={String(views30)} />
        <Stat icon={<IconLock />} label="PIN-ээр нээсэн" value={String(pinOk)} />
        <Stat icon={<IconShield />} label="Картын төлөв" value={card.active ? "Идэвхтэй" : "Идэвхгүй"}
          tone={card.active ? "text-emerald-600" : "text-amber-600"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-2">
          <h2 className="h-section">Таны QR код</h2>
          <div className="mt-4 flex justify-center rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Яаралтай картын QR код" className="h-52 w-52" />
          </div>
          <p className="mt-3 break-all text-center text-xs text-slate-500">{url}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/e/${card.token}`} target="_blank" className="btn-secondary text-xs">Нийтийн харагдац</Link>
            <Link href="/dashboard/qr" className="btn-secondary text-xs">Татах / хэвлэх</Link>
          </div>
          <div className="mt-5 flex justify-around border-t border-slate-200 pt-4 text-center text-xs dark:border-slate-800">
            <div><p className="text-lg font-bold text-emerald-600">{counts.public ?? 0}</p>Нээлттэй</div>
            <div><p className="text-lg font-bold text-amber-600">{counts.pin ?? 0}</p>PIN-ээр</div>
            <div><p className="text-lg font-bold text-slate-500">{counts.hidden ?? 0}</p>Нуусан</div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="card p-6">
            <h2 className="h-section">Бэлэн байдлын жагсаалт</h2>
            <ul className="mt-4 space-y-2">
              {tasks.map((t) => (
                <li key={t.label}>
                  <Link href={t.href} className="flex items-center gap-3 rounded-xl p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${t.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 dark:border-slate-600"}`}>
                      {t.done && <IconCheck className="h-4 w-4" />}
                    </span>
                    <span className={t.done ? "text-slate-400 line-through" : ""}>{t.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="h-section">Сүүлийн хандалтууд</h2>
              <Link href="/dashboard/logs" className="text-sm font-semibold text-brand-600 hover:underline">Бүгдийг харах</Link>
            </div>
            {lastLogs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Одоогоор таны QR-ийг хэн ч уншуулаагүй байна.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {lastLogs.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className={`badge ${EV[l.event]?.[1] ?? ""}`}>{EV[l.event]?.[0] ?? l.event}</span>
                    <span className="flex-1 truncate text-slate-600 dark:text-slate-400">{describeUserAgent(l.userAgent)} · {l.ipMasked}</span>
                    <span className="text-xs text-slate-500" title={fmtDateTime(l.createdAt)}>{relTime(l.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value, tone = "", children }: { icon: React.ReactNode; label: string; value: string; tone?: string; children?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm text-slate-500"><span className="text-brand-600">{icon}</span>{label}</div>
      <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
      {children}
    </div>
  );
}
