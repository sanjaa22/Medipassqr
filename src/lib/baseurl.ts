/**
 * Сайтын нийтийн хаяг (QR кодонд орох URL-ийн суурь) тодорхойлох логик. Цэвэр функцүүд — тест хийхэд хялбар.
 *
 * Дараалал:
 *  1) NEXT_PUBLIC_APP_URL (production дээр localhost утгыг ҮЛ ТООНО — .env-ээс санамсаргүй хуулагдсан байж болно)
 *  2) VERCEL_PROJECT_PRODUCTION_URL (Vercel-ийн тогтмол production домэйн)
 *  3) Хүсэлтийн host (card.ts дотор) — локал дээр LAN IP-ээр нээвэл утаснаас уншуулж туршиж болно
 */
type Env = Record<string, string | undefined>;

export const isLocalUrl = (u: string) => /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/i.test(u.trim());

function clean(u: string) {
  const t = u.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Тогтмол (deployment бүрээр өөрчлөгддөггүй) хаяг, байхгүй бол null */
export function stableBaseUrl(env: Env): string | null {
  const prod = env.NODE_ENV === "production";
  const fromEnv = env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv && !(prod && isLocalUrl(fromEnv))) return clean(fromEnv);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return clean(env.VERCEL_PROJECT_PRODUCTION_URL);
  return null;
}

/** Имэйл дэх холбоос зэрэгт: хүсэлтийн host-д ҮЛ ИТГЭНЭ (Host header injection-ээс сэргийлнэ) */
export function emailBaseUrl(env: Env): string {
  return stableBaseUrl(env) ?? (env.VERCEL_URL ? clean(env.VERCEL_URL) : "http://localhost:3000");
}

/** Хүсэлтийн толгойноос origin үүсгэнэ; host хэлбэр нь эргэлзээтэй бол null */
export function originFromHeaders(host?: string | null, proto?: string | null): string | null {
  const h = host?.split(",")[0].trim();
  if (!h || !/^[a-z0-9.\-:[\]]+$/i.test(h)) return null;
  const p = proto?.split(",")[0].trim().toLowerCase();
  const scheme = p === "http" || p === "https" ? p : isLocalUrl(h) ? "http" : "https";
  return `${scheme}://${h}`;
}
