"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { medicalSchema, saveMedical } from "@/lib/profile";
import { FIELDS, normalizeVisibility } from "@/lib/fields";
import { ensureCard } from "@/lib/card";
import { newCardToken } from "@/lib/crypto";
import { logEvent } from "@/lib/events";
import { createSession, destroySession } from "@/lib/session";
import { passwordSchema } from "@/lib/validation";
import type { FormState } from "@/components/FormMessage";

/* ---------- Эрүүл мэндийн мэдээлэл ---------- */
export async function saveProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw: Record<string, unknown> = {};
  for (const k of Object.keys(medicalSchema.shape)) if (k !== "contacts") raw[k] = fd.get(k) ?? "";
  const names = fd.getAll("c_name"), rels = fd.getAll("c_relation"), phones = fd.getAll("c_phone");
  raw.contacts = names
    .map((n, i) => ({ name: String(n), relation: String(rels[i] ?? ""), phone: String(phones[i] ?? "") }))
    .filter((c) => c.name.trim() || c.phone.trim());

  const parsed = medicalSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(" › ")}: ${issue.message}` };
  }
  await saveMedical(user.id, parsed.data);
  await logEvent(user.id, "profile_update");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Мэдээлэл амжилттай хадгалагдлаа. Таны QR карт шинэчлэгдсэн." };
}

/* ---------- Нууцлал ---------- */
export async function saveVisibilityAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  const vis = normalizeVisibility(Object.fromEntries(FIELDS.map((f) => [f.key, fd.get(`vis_${f.key}`)])));
  const expires = String(fd.get("expiresAt") ?? "");
  let expiresAt: Date | null = null;
  if (expires) {
    expiresAt = new Date(`${expires}T23:59:59`);
    if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) return { error: "Дуусах огноо ирээдүйд байх ёстой." };
  }
  if (!card.pinHash && Object.values(vis).includes("pin")) {
    // PIN тохируулаагүй бол PIN талбарууд хэн ч харах боломжгүй — анхааруулга
    await prisma.card.update({ where: { id: card.id }, data: { visibility: vis, expiresAt } });
    await logEvent(user.id, "privacy_update");
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Хадгаллаа. Анхаар: PIN код тохируулаагүй тул “PIN-ээр” талбаруудыг хэн ч нээх боломжгүй." };
  }
  await prisma.card.update({ where: { id: card.id }, data: { visibility: vis, expiresAt } });
  await logEvent(user.id, "privacy_update");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Нууцлалын тохиргоо хадгалагдлаа." };
}

export async function setPinAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const pin = String(fd.get("pin") ?? "");
  const confirm = String(fd.get("pinConfirm") ?? "");
  if (!/^\d{4,6}$/.test(pin)) return { error: "PIN нь 4–6 оронтой тоо байна." };
  if (/^(\d)\1+$/.test(pin) || "0123456789".includes(pin) || "9876543210".includes(pin))
    return { error: "Хэт амархан PIN байна (1111, 1234 г.м.). Өөр PIN сонгоно уу." };
  if (pin !== confirm) return { error: "PIN код таарахгүй байна." };
  const card = await ensureCard(user.id);
  await prisma.card.update({ where: { id: card.id }, data: { pinHash: await bcrypt.hash(pin, 10) } });
  await logEvent(user.id, "pin_set");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "PIN код амжилттай тохирууллаа." };
}

export async function removePinAction() {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  await prisma.card.update({ where: { id: card.id }, data: { pinHash: null } });
  await logEvent(user.id, "pin_remove");
  revalidatePath("/dashboard", "layout");
}

export async function toggleCardAction() {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  await prisma.card.update({ where: { id: card.id }, data: { active: !card.active } });
  await logEvent(user.id, "card_toggle", card.active ? "идэвхгүй" : "идэвхтэй");
  revalidatePath("/dashboard", "layout");
}

export async function rotateTokenAction() {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  await prisma.card.update({ where: { id: card.id }, data: { token: newCardToken(), rotatedAt: new Date() } });
  await logEvent(user.id, "token_rotate");
  revalidatePath("/dashboard", "layout");
}

export async function clearLogsAction() {
  const user = await requireUser();
  const card = await ensureCard(user.id);
  await prisma.accessLog.deleteMany({ where: { cardId: card.id } });
  await logEvent(user.id, "logs_clear");
  revalidatePath("/dashboard", "layout");
}

/* ---------- Бүртгэлийн тохиргоо ---------- */
export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next = passwordSchema.safeParse(String(fd.get("password") ?? ""));
  if (!next.success) return { error: next.error.issues[0].message };
  if (next.data !== String(fd.get("confirm") ?? "")) return { error: "Шинэ нууц үг таарахгүй байна." };
  const db = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(current, db.passwordHash))) return { error: "Одоогийн нууц үг буруу байна." };
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next.data, 12), sessionVersion: { increment: 1 } },
  });
  await logEvent(user.id, "password_change");
  await createSession(user.id, updated.sessionVersion); // бусад төхөөрөмжийн сешн хүчингүй болно
  return { ok: true, message: "Нууц үг солигдлоо. Бусад бүх төхөөрөмжөөс автоматаар гаргалаа." };
}

const nameSchema = z.string().trim().min(2, "Нэр хэт богино").max(60);
export async function updateNameAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const p = nameSchema.safeParse(fd.get("name"));
  if (!p.success) return { error: p.error.issues[0].message };
  await prisma.user.update({ where: { id: user.id }, data: { name: p.data } });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Нэр шинэчлэгдлээ." };
}

export async function logoutAllAction() {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  await logEvent(user.id, "logout_all");
  await destroySession();
  redirect("/login");
}

export async function deleteAccountAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const db = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (String(fd.get("confirmEmail") ?? "").trim().toLowerCase() !== db.email) return { error: "Имэйл хаяг таарахгүй байна." };
  if (!(await bcrypt.compare(String(fd.get("password") ?? ""), db.passwordHash))) return { error: "Нууц үг буруу байна." };
  await prisma.user.delete({ where: { id: user.id } }); // Cascade: профайл, карт, лог бүгд устна
  await destroySession();
  redirect("/?deleted=1");
}
