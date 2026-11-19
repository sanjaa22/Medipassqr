/** Яаралтай картын талбарууд ба тэдгээрийн харагдах түвшин */
export type Visibility = "public" | "pin" | "hidden";

export const FIELDS = [
  { key: "fullName", mn: "Овог нэр", en: "Full name", def: "public" },
  { key: "birthDate", mn: "Төрсөн огноо / нас", en: "Date of birth / age", def: "public" },
  { key: "gender", mn: "Хүйс", en: "Sex", def: "public" },
  { key: "bloodType", mn: "Цусны бүлэг", en: "Blood type", def: "public" },
  { key: "allergies", mn: "Харшил", en: "Allergies", def: "public" },
  { key: "conditions", mn: "Архаг өвчин", en: "Medical conditions", def: "public" },
  { key: "medications", mn: "Хэрэглэдэг эм", en: "Medications", def: "pin" },
  { key: "contacts", mn: "Яаралтай холбоо барих", en: "Emergency contacts", def: "public" },
  { key: "organDonor", mn: "Эрхтэн хандивлагч", en: "Organ donor", def: "public" },
  { key: "body", mn: "Өндөр / жин", en: "Height / weight", def: "pin" },
  { key: "doctor", mn: "Эмчлэгч эмч", en: "Primary doctor", def: "pin" },
  { key: "insuranceNo", mn: "ЭМД-ын дугаар", en: "Health insurance no.", def: "pin" },
  { key: "notes", mn: "Нэмэлт тэмдэглэл", en: "Additional notes", def: "pin" },
  { key: "registerNo", mn: "Регистрийн дугаар", en: "National ID", def: "hidden" },
  { key: "address", mn: "Гэрийн хаяг", en: "Home address", def: "hidden" },
] as const satisfies ReadonlyArray<{ key: string; mn: string; en: string; def: Visibility }>;

export type FieldKey = (typeof FIELDS)[number]["key"];
export type VisibilityMap = Record<FieldKey, Visibility>;

export function defaultVisibility(): VisibilityMap {
  return Object.fromEntries(FIELDS.map((f) => [f.key, f.def])) as VisibilityMap;
}

export function normalizeVisibility(v: unknown): VisibilityMap {
  const base = defaultVisibility();
  if (v && typeof v === "object") {
    for (const f of FIELDS) {
      const val = (v as Record<string, unknown>)[f.key];
      if (val === "public" || val === "pin" || val === "hidden") base[f.key] = val;
    }
  }
  return base;
}

export const BLOOD_TYPES = ["O(I) Rh+", "O(I) Rh−", "A(II) Rh+", "A(II) Rh−", "B(III) Rh+", "B(III) Rh−", "AB(IV) Rh+", "AB(IV) Rh−", "Мэдэхгүй"];

export const VIS_LABEL: Record<Visibility, string> = {
  public: "Нээлттэй",
  pin: "PIN-ээр",
  hidden: "Нуусан",
};
