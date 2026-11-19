import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";
import { emailBaseUrl, stableBaseUrl, originFromHeaders } from "./baseurl";
import { newCardToken } from "./crypto";
import { defaultVisibility } from "./fields";

export async function ensureCard(userId: string) {
  const existing = await prisma.card.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.card.create({
    data: { userId, token: newCardToken(), visibility: defaultVisibility() },
  });
}

/** Имэйлд ордог хаяг (хүсэлтийн host-д итгэхгүй) */
export function appUrl() {
  return emailBaseUrl(process.env);
}

/** QR кодонд орох суурь хаяг: тогтмол домэйн, байхгүй бол яг одоо нээгдсэн хаяг */
export async function baseUrl() {
  const stable = stableBaseUrl(process.env);
  if (stable) return stable;
  const h = await headers();
  return originFromHeaders(h.get("x-forwarded-host") ?? h.get("host"), h.get("x-forwarded-proto")) ?? appUrl();
}

export async function cardUrl(token: string) {
  return `${await baseUrl()}/e/${token}`;
}
