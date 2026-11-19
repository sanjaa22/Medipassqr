import "server-only";
import { headers } from "next/headers";

/**
 * Хэрэглэгчийн IP. Хэрэглэгч өөрөө илгээсэн `X-Forwarded-For`-ийн ЭХНИЙ утгыг итгэж болохгүй
 * (хуурамчаар бичиж rate limit-ээс мултарч болно). Тиймээс прокси-гийн тавьсан `x-real-ip`-г,
 * байхгүй бол `X-Forwarded-For`-ийн СҮҮЛИЙН утгыг авна. (Vercel дээр хоёулаа зөв ажиллана.)
 */
export async function getClientInfo() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const last = fwd ? fwd.split(",").pop() : null;
  const ip = (h.get("x-real-ip") ?? last)?.trim() || "0.0.0.0";
  const userAgent = (h.get("user-agent") ?? "").slice(0, 300);
  return { ip, userAgent };
}

export function describeUserAgent(ua: string): string {
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Бусад";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Хөтөч";
  return `${br} · ${os}`;
}
