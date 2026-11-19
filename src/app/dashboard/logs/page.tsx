import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureCard } from "@/lib/card";
import { describeUserAgent } from "@/lib/request";
import { fmtDateTime } from "@/lib/format";
import { EVENT_LABEL } from "@/lib/events";
import PageHeader from "@/components/PageHeader";
import EventBadge from "@/components/EventBadge";
import ConfirmButton from "@/components/ConfirmButton";
import { clearLogsAction } from "@/app/actions/dashboard";

export const metadata = { title: "Хандалтын түүх" };

const FILTERS = [["all", "Бүгд"], ["view", "Үзсэн"], ["pin_ok", "PIN нээсэн"], ["pin_fail", "Буруу PIN"], ["blocked", "Хаалттай үед"]] as const;

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  const { f = "all" } = await searchParams;
  const where = { cardId: card.id, ...(f !== "all" ? { event: f } : {}) };
  const [logs, events, byDay] = await Promise.all([
    prisma.accessLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.securityEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.accessLog.findMany({ where: { cardId: card.id, createdAt: { gte: new Date(Date.now() - 14 * 86400000) } }, select: { createdAt: true } }),
  ]);

  // Сүүлийн 14 хоногийн график
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return { key: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, n: 0 };
  });
  for (const l of byDay) { const k = l.createdAt.toISOString().slice(0, 10); const d = days.find((x) => x.key === k); if (d) d.n++; }
  const max = Math.max(1, ...days.map((d) => d.n));

  return (
    <>
      <PageHeader title="Хандалтын түүх" desc="Таны QR кодыг хэзээ, ямар төхөөрөмжөөс уншуулсныг харуулна. IP хаяг хэсэгчлэн нуугдсан.">
        <form action={clearLogsAction}>
          <ConfirmButton message="Бүх хандалтын түүхийг устгах уу?" className="btn-secondary">Түүх цэвэрлэх</ConfirmButton>
        </form>
      </PageHeader>

      <div className="card p-6">
        <h2 className="h-section">Сүүлийн 14 хоног</h2>
        <div className="mt-5 flex h-36 items-end gap-1.5" role="img" aria-label="Өдөр тутмын хандалтын график">
          {days.map((d) => (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100">{d.n}</span>
              <div className="w-full rounded-t-md bg-brand-500/80 transition group-hover:bg-brand-600" style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 4 : 2 }} />
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-4 dark:border-slate-800">
          {FILTERS.map(([k, l]) => (
            <a key={k} href={`?f=${k}`} className={`rounded-full px-3 py-1 text-xs font-semibold ${f === k ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{l}</a>
          ))}
        </div>
        {logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Бичлэг алга.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                <tr><th className="px-4 py-3">Огноо</th><th className="px-4 py-3">Үйлдэл</th><th className="px-4 py-3">Төхөөрөмж</th><th className="px-4 py-3">IP</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-4 py-3">{fmtDateTime(l.createdAt)}</td>
                    <td className="px-4 py-3"><EventBadge event={l.event} /></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{describeUserAgent(l.userAgent)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.ipMasked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="h-section">Бүртгэлийн аюулгүй байдлын үйл явдал</h2>
        <ul className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className={e.type === "login_fail" || e.type === "locked" ? "font-semibold text-red-600" : ""}>{EVENT_LABEL[e.type] ?? e.type}{e.detail && ` (${e.detail})`}</span>
              <span className="text-xs text-slate-500">{fmtDateTime(e.createdAt)} · {e.ipMasked}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
