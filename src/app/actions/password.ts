"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { getClientInfo } from "@/lib/request";
import { hashIp, hashKey, sha256, newResetToken } from "@/lib/crypto";
import { explainServerError } from "@/lib/dberror";
import { logEvent } from "@/lib/events";
import { appUrl } from "@/lib/card";
import { sendMail } from "@/lib/mail";
import { passwordSchema } from "@/lib/validation";
import type { FormState } from "@/components/FormMessage";

const RESET_MIN = 30;
// Имэйл бүртгэлтэй эсэхээс үл хамааран ИЖИЛ хариу өгнө (хэрэглэгч байгаа эсэхийг ил гаргахгүй)
const SENT_MSG = "Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх холбоос илгээлээ. Имэйлээ (мөн Spam хавтас) шалгана уу. Холбоос 30 минут хүчинтэй.";

export async function requestResetAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(String(fd.get("email") ?? ""));
  if (!parsed.success) return { error: "Имэйл хаяг буруу байна.", values: { email: String(fd.get("email") ?? "") } };
  const email = parsed.data;

  try {
    const { ip } = await getClientInfo();
    const byIp = await rateLimit(`reset:ip:${hashIp(ip)}`, 5, 3600);
    const byMail = await rateLimit(`reset:mail:${hashKey(email)}`, 3, 3600);
    if (!byIp.ok || !byMail.ok) return { error: "Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.", values: { email } };

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (user) {
      const token = newResetToken();
      await prisma.$transaction([
        prisma.passwordReset.deleteMany({ where: { userId: user.id } }), // өмнөх холбоосууд хүчингүй болно
        prisma.passwordReset.create({
          data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_MIN * 60000) },
        }),
      ]);
      await logEvent(user.id, "reset_request").catch(() => {});
      await sendMail(
        email,
        "MediPass — нууц үг сэргээх",
        `Сайн байна уу, ${user.name}!\n\nНууц үгээ сэргээхийн тулд доорх холбоос дээр дарна уу (${RESET_MIN} минут хүчинтэй, нэг удаа ашиглагдана):\n\n${appUrl()}/reset/${token}\n\nХэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тооно уу — таны нууц үг өөрчлөгдөхгүй.`,
      );
    }
    return { message: SENT_MSG, values: { email } };
  } catch (e) {
    return { error: explainServerError(e), values: { email } };
  }
}

const resetSchema = z
  .object({ password: passwordSchema, confirm: z.string().min(1, "Нууц үгээ давтан оруулна уу") })
  .refine((d) => d.password === d.confirm, { message: "Нууц үг таарахгүй байна", path: ["confirm"] });

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") ?? "");
  const parsed = resetSchema.safeParse({ password: String(fd.get("password") ?? ""), confirm: String(fd.get("confirm") ?? "") });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { error: parsed.error.issues[0].message, fieldErrors };
  }

  try {
    const { ip } = await getClientInfo();
    const rl = await rateLimit(`reset:use:${hashIp(ip)}`, 10, 3600);
    if (!rl.ok) return { error: "Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу." };

    const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date())
      return { error: "Холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Шинээр хүсэлт илгээнэ үү." };

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        // sessionVersion нэмэгдэх тул бүх төхөөрөмж дээрх нэвтрэлт хүчингүй болно
        data: { passwordHash, sessionVersion: { increment: 1 }, failedLogins: 0, lockedUntil: null },
      }),
      prisma.passwordReset.deleteMany({ where: { userId: row.userId } }),
    ]);
    await logEvent(row.userId, "password_reset").catch(() => {});
  } catch (e) {
    return { error: explainServerError(e) };
  }
  redirect("/login?reset=1");
}
