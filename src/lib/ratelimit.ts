import "server-only";
import { prisma } from "./db";

/**
 * Тогтмол цонхтой (fixed window) хязгаарлагч. Serverless орчинд санах ой хуваалцдаггүй
 * тул өгөгдлийн санд тоолуур хадгална.
 *
 * Нэмэгдүүлэлт нь НЭГ SQL-ээр (INSERT ... ON CONFLICT DO UPDATE) атомаар хийгдэнэ —
 * зэрэгцээ олон хүсэлт ирсэн ч хязгаарыг давж гарах боломжгүй.
 * @returns ok=false бол хязгаар хэтэрсэн, retryAfter — секунд
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, (NOW() AT TIME ZONE 'UTC') + (${windowSec}::double precision * INTERVAL '1 second'))
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < (NOW() AT TIME ZONE 'UTC')
                       THEN (NOW() AT TIME ZONE 'UTC') + (${windowSec}::double precision * INTERVAL '1 second')
                       ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const count = Number(rows[0].count);
  const resetAt = new Date(rows[0].resetAt);
  void maybeCleanup();
  if (count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000)) };
  }
  return { ok: true, remaining: Math.max(0, limit - count), retryAfter: 0 };
}

/** Тоолуурыг нэмэгдүүлэлгүй, зөвхөн хязгаар хэтэрсэн эсэхийг шалгана */
export async function isRateLimited(key: string, limit: number) {
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt.getTime() < Date.now() || row.count < limit) return { blocked: false, retryAfter: 0 };
  return { blocked: true, retryAfter: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
}

export async function resetRateLimit(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

/** Хуучирсан мөрүүдийг хааяа (≈2% хүсэлтэд) цэвэрлэнэ — хүснэгт хэт томрохоос сэргийлнэ */
async function maybeCleanup() {
  if (Math.random() > 0.02) return;
  try {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 3600_000) } } });
  } catch {
    /* цэвэрлэгээ амжилтгүй байсан ч гол үйлдэлд нөлөөлөхгүй */
  }
}
