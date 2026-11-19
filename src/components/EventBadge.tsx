export const EV: Record<string, [string, string]> = {
  view: ["Үзсэн", "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"],
  pin_ok: ["PIN нээсэн", "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"],
  pin_fail: ["Буруу PIN", "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"],
  blocked: ["Хаалттай үед", "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"],
};

export default function EventBadge({ event }: { event: string }) {
  const [label, cls] = EV[event] ?? [event, "bg-slate-100 text-slate-700"];
  return <span className={`badge ${cls}`}>{label}</span>;
}
