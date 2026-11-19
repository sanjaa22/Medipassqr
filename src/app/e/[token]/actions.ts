"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { rateLimit, isRateLimited } from "@/lib/ratelimit";
import { getClientInfo } from "@/lib/request";
import { hashIp, maskIp } from "@/lib/crypto";
import { grantUnlock } from "@/lib/session";

export type PinState = { error?: string } | undefined;

export async function unlockAction(_: PinState, fd: FormData): Promise<PinState> {
  const token = String(fd.get("token") ?? "");
  const pin = String(fd.get("pin") ?? "");
  const card = await prisma.card.findUnique({ where: { token } });
  if (!card || !card.active || !card.pinHash) return { error: "Энэ картыг нээх боломжгүй." };

  const { ip, userAgent } = await getClientInfo();
  const ipHash = hashIp(ip);
  // 1) IP бүрт: 15 минутад 5 оролдлого
  const rl = await rateLimit(`pin:${card.id}:${ipHash}`, 5, 900);
  if (!rl.ok) return { error: `Хэт олон буруу оролдлого. ${Math.ceil(rl.retryAfter / 60)} минутын дараа дахин оролдоно уу.` };
  // 2) Картад нийт: олон IP-ээс (botnet) тархаж таах халдлагаас сэргийлнэ. Зөвхөн БУРУУ оролдлогыг тоолно —
  //    жинхэнэ PIN оруулсан хүнд нөлөөлөхгүй. Хязгаар хэтэрвэл PIN-ээр хамгаалсан мэдээлэл түр хаагдана.
  const global = await isRateLimited(`pinfail:${card.id}`, 25);
  if (global.blocked) return { error: `Энэ картад хэт олон буруу PIN оролдлого хийгдсэн тул түр хаагдлаа. ${Math.ceil(global.retryAfter / 60)} минутын дараа дахин оролдоно уу.` };

  const ok = /^\d{4,6}$/.test(pin) && (await bcrypt.compare(pin, card.pinHash));
  await prisma.accessLog.create({ data: { cardId: card.id, event: ok ? "pin_ok" : "pin_fail", ipHash, ipMasked: maskIp(ip), userAgent } });
  if (!ok) await rateLimit(`pinfail:${card.id}`, 25, 3600);
  if (!ok) return { error: `PIN буруу байна. Үлдсэн оролдлого: ${rl.remaining}` };

  await grantUnlock(card.id, card.rotatedAt);
  revalidatePath(`/e/${token}`);
  return undefined;
}
