import "server-only";
import { z } from "zod";
import { prisma } from "./db";
import { decrypt, encrypt } from "./crypto";

const phone = z.string().trim().max(20).regex(/^[+0-9\s()-]*$/, "Утасны дугаар буруу");

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Нэр оруулна уу").max(80),
  relation: z.string().trim().max(40).default(""),
  phone: phone.min(6, "Утасны дугаар оруулна уу"),
});

export const medicalSchema = z.object({
  fullName: z.string().trim().max(100).default(""),
  birthDate: z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Огноо буруу").default(""),
  gender: z.enum(["", "Эрэгтэй", "Эмэгтэй", "Бусад"]).default(""),
  bloodType: z.string().trim().max(20).default(""),
  heightCm: z.string().trim().regex(/^(\d{2,3})?$/, "Өндөр буруу").default(""),
  weightKg: z.string().trim().regex(/^(\d{1,3}(\.\d)?)?$/, "Жин буруу").default(""),
  allergies: z.string().trim().max(1000).default(""),
  conditions: z.string().trim().max(1000).default(""),
  medications: z.string().trim().max(1000).default(""),
  organDonor: z.enum(["", "yes", "no"]).default(""),
  insuranceNo: z.string().trim().max(30).default(""),
  registerNo: z.string().trim().max(12).regex(/^([А-ЯӨҮЁа-яөүё]{2}\d{8})?$/, "Регистр: 2 үсэг + 8 тоо").default(""),
  doctorName: z.string().trim().max(80).default(""),
  doctorPhone: phone.default(""),
  address: z.string().trim().max(300).default(""),
  notes: z.string().trim().max(1500).default(""),
  contacts: z.array(contactSchema).max(5).default([]),
});

export type MedicalData = z.infer<typeof medicalSchema>;

export function emptyMedical(): MedicalData {
  return medicalSchema.parse({});
}

export async function getMedical(userId: string): Promise<MedicalData> {
  const p = await prisma.profile.findUnique({ where: { userId } });
  if (!p) return emptyMedical();
  try {
    return medicalSchema.parse(JSON.parse(decrypt(p.encData)));
  } catch {
    return emptyMedical();
  }
}

export async function saveMedical(userId: string, data: MedicalData) {
  const encData = encrypt(JSON.stringify(data));
  await prisma.profile.upsert({ where: { userId }, create: { userId, encData }, update: { encData } });
}

/** Профайл хэр бүрэн бөглөгдсөнийг хувиар */
export function completeness(d: MedicalData): number {
  const checks = [
    d.fullName, d.birthDate, d.gender, d.bloodType, d.allergies, d.conditions,
    d.medications, d.contacts.length ? "1" : "", d.organDonor, d.insuranceNo,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function ageFrom(birth: string): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}
