const TZ = "Asia/Ulaanbaatar";

export function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("mn-MN", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
}
export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("mn-MN", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function relTime(d: Date) {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "дөнгөж сая";
  if (s < 3600) return `${Math.floor(s / 60)} мин өмнө`;
  if (s < 86400) return `${Math.floor(s / 3600)} цагийн өмнө`;
  if (s < 30 * 86400) return `${Math.floor(s / 86400)} өдрийн өмнө`;
  return fmtDate(d);
}
