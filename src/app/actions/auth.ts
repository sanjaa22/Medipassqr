"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit, resetRateLimit } from "@/lib/ratelimit";
import { getClientInfo } from "@/lib/request";
import { hashIp, encrypt, newCardToken } from "@/lib/crypto";
import { defaultVisibility } from "@/lib/fields";
import { explainServerError } from "@/lib/dberror";
import { logEvent } from "@/lib/events";
import { emptyMedical } from "@/lib/profile";
import type { FormState } from "@/components/FormMessage";
import { passwordSchema } from "@/lib/validation";

const MAX_FAILS = 5;
const LOCK_MIN = 15;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Нэрээ оруулна уу (2+ тэмдэгт)").max(60, "Нэр хэт урт байна"),
    email: z.string().trim().toLowerCase().email("Имэйл хаяг буруу байна"),
    password: passwordSchema,
    confirm: z.string().min(1, "Нууц үгээ давтан оруулна уу"),
    agree: z.literal("on", { error: "Нууцлалын бодлогыг зөвшөөрнө үү" }),
  })
  .refine((d) => d.password === d.confirm, { message: "Нууц үг таарахгүй байна", path: ["confirm"] });

function safeNext(n: FormDataEntryValue | null) {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/dashboard") ? s : "/dashboard";
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const raw = {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
    confirm: String(fd.get("confirm") ?? ""),
    agree: fd.get("agree") ? "on" : "",
  };
  // Алдаа гарсан үед форм цэвэрлэгдэхгүйн тулд нэр, имэйлийг буцааж өгнө (нууц үгийг хэзээ ч буцаахгүй)
  const values = { name: raw.name, email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = i.message;
    }
    return { error: parsed.error.issues[0].message, fieldErrors, values };
  }
  const { name, email, password } = parsed.data;

  try {
    // Дэндүү олон бүртгэлээс хамгаална (амжилттай шалгалтаас хойш тоолно — буруу бичсэн оролдлого тоологдохгүй).
    // Локал хөгжүүлэлтийн үед IP тодорхойгүй тул хязгаарлалтыг идэвхгүй болгоно.
    if (process.env.NODE_ENV === "production") {
      const { ip } = await getClientInfo();
      const rl = await rateLimit(`reg:${hashIp(ip)}`, 10, 3600);
      if (!rl.ok) return { error: "Хэт олон бүртгэл үүсгэх оролдлого. Түр хүлээгээд дахин оролдоно уу.", values };
    }

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return { error: "Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна. Нэвтэрнэ үү.", fieldErrors: { email: "Энэ имэйл бүртгэлтэй байна" }, values };

    // Хэрэглэгч + эрүүл мэндийн профайл + QR карт — нэг бичилтээр (аль нэг нь алдаатай бол бүгд цуцлагдана)
    const medical = encrypt(JSON.stringify({ ...emptyMedical(), fullName: name }));
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        profile: { create: { encData: medical } },
        card: { create: { token: newCardToken(), visibility: defaultVisibility() } },
      },
      select: { id: true, sessionVersion: true },
    });
    await logEvent(user.id, "register").catch(() => {}); // бүртгэлийн түүх бичигдээгүй ч бүртгэл амжилттай
    await createSession(user.id, user.sessionVersion);
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002")
      return { error: "Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна. Нэвтэрнэ үү.", fieldErrors: { email: "Энэ имэйл бүртгэлтэй байна" }, values };
    return { error: explainServerError(e), values };
  }
  redirect("/dashboard/profile?welcome=1");
}

async function doLogin(fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Имэйл болон нууц үгээ оруулна уу." };

  const { ip } = await getClientInfo();
  const rl = await rateLimit(`login:${hashIp(ip)}`, 20, 900);
  if (!rl.ok) return { error: `Хэт олон оролдлого. ${Math.ceil(rl.retryAfter / 60)} минутын дараа дахин оролдоно уу.` };

  const user = await prisma.user.findUnique({ where: { email } });
  // Хэрэглэгч байгаа эсэхийг ил гаргахгүйн тулд ижил хугацаа зарцуулна
  if (!user) {
    await bcrypt.compare(password, "$2b$12$1smkmdcDQNQ0m/jnGYkfm.sG4GzZR178Pds5pZdcGcknJbPjDixxy");
    return { error: "Имэйл эсвэл нууц үг буруу байна." };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const min = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Олон удаа буруу оролдсон тул бүртгэл ${min} минут түгжигдсэн байна.` };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const fails = user.failedLogins + 1;
    const lock = fails >= MAX_FAILS;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: lock ? 0 : fails, lockedUntil: lock ? new Date(Date.now() + LOCK_MIN * 60000) : null },
    });
    await logEvent(user.id, lock ? "locked" : "login_fail");
    return {
      error: lock
        ? `Олон удаа буруу оролдсон тул бүртгэл ${LOCK_MIN} минут түгжигдлээ.`
        : `Имэйл эсвэл нууц үг буруу байна. (Үлдсэн оролдлого: ${MAX_FAILS - fails})`,
    };
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  await resetRateLimit(`login:${hashIp(ip)}`);
  await logEvent(user.id, "login");
  await createSession(user.id, user.sessionVersion);
  return { ok: true };
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const values = { email: String(fd.get("email") ?? "").trim() };
  let res: FormState;
  try {
    res = await doLogin(fd);
  } catch (e) {
    return { error: explainServerError(e), values };
  }
  if (!res?.ok) return { ...res, values };
  redirect(safeNext(fd.get("next")));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
