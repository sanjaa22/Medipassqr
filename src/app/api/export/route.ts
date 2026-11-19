import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMedical } from "@/lib/profile";
import { ensureCard, cardUrl } from "@/lib/card";
import { normalizeVisibility } from "@/lib/fields";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  const [medical, card] = await Promise.all([getMedical(user.id), ensureCard(user.id)]);
  const [logs, events] = await Promise.all([
    prisma.accessLog.findMany({ where: { cardId: card.id }, orderBy: { createdAt: "desc" }, select: { event: true, ipMasked: true, userAgent: true, createdAt: true } }),
    prisma.securityEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { type: true, detail: true, ipMasked: true, createdAt: true } }),
  ]);
  await logEvent(user.id, "export");
  const body = {
    exportedAt: new Date().toISOString(),
    account: { name: user.name, email: user.email, createdAt: user.createdAt },
    medical,
    card: { url: await cardUrl(card.token), active: card.active, hasPin: !!card.pinHash, expiresAt: card.expiresAt, visibility: normalizeVisibility(card.visibility) },
    accessLogs: logs,
    securityEvents: events,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="medipass-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
