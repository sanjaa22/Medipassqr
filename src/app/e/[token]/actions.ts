"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
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
  const rl = await rateLimit(`pin:${card.id}:${ipHash}`, 5, 900);
  if (!rl.ok) return { error: `Хэт олон буруу оролдлого. ${Math.ceil(rl.retryAfter / 60)} минутын дараа дахин оролдоно уу.` };

  const ok = /^\d{4,6}$/.test(pin) && (await bcrypt.compare(pin, card.pinHash));
  await prisma.accessLog.create({ data: { cardId: card.id, event: ok ? "pin_ok" : "pin_fail", ipHash, ipMasked: maskIp(ip), userAgent } });
  if (!ok) return { error: `PIN буруу байна. Үлдсэн оролдлого: ${rl.remaining}` };

  await grantUnlock(card.id, card.rotatedAt);
  revalidatePath(`/e/${token}`);
  return undefined;
}
