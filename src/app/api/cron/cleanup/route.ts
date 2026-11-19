import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Өдөр бүр ажиллаж хуучирсан мөрүүдийг цэвэрлэнэ (vercel.json-д cron тохируулсан).
 * Хамгаалалт: CRON_SECRET орчны хувьсагч тохируулсан байх ёстой, Vercel Cron автоматаар
 * `Authorization: Bearer <CRON_SECRET>` илгээнэ.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET тохируулаагүй" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const day = 86_400_000;
  const now = Date.now();
  const [rate, resets, access, events] = await Promise.all([
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(now - 3_600_000) } } }),
    prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: new Date(now - day) } } }),
    prisma.accessLog.deleteMany({ where: { createdAt: { lt: new Date(now - 180 * day) } } }),
    prisma.securityEvent.deleteMany({ where: { createdAt: { lt: new Date(now - 365 * day) } } }),
  ]);
  return NextResponse.json({ rateLimit: rate.count, passwordResets: resets.count, accessLogs: access.count, securityEvents: events.count });
}
