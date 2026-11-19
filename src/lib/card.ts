import "server-only";
import { prisma } from "./db";
import { newCardToken } from "./crypto";
import { defaultVisibility } from "./fields";

export async function ensureCard(userId: string) {
  const existing = await prisma.card.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.card.create({
    data: { userId, token: newCardToken(), visibility: defaultVisibility() },
  });
}

export function appUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function cardUrl(token: string) {
  return `${appUrl()}/e/${token}`;
}
