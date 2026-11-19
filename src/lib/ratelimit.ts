import "server-only";
import { prisma } from "./db";

/**
 * Тогтмол цонхтой (fixed window) хязгаарлагч. Serverless орчинд санах ой хуваалцдаггүй
 * тул өгөгдлийн санд тоолуур хадгална.
 * @returns ok=false бол хязгаар хэтэрсэн, retryAfter — секунд
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSec * 1000);
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (row.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000) };
  }
  const updated = await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { ok: true, remaining: Math.max(0, limit - updated.count), retryAfter: 0 };
}

export async function resetRateLimit(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
