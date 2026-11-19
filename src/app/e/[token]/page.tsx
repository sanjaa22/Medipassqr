import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getMedical, ageFrom } from "@/lib/profile";
import { FIELDS, normalizeVisibility, type FieldKey } from "@/lib/fields";
import { hasUnlock } from "@/lib/session";
import { getClientInfo } from "@/lib/request";
import { hashIp, maskIp } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { IconPhone, IconAlert, IconPill, IconHeart, IconDrop, IconUser } from "@/components/Icons";
import PinUnlock from "./PinUnlock";
import ShareLocation from "./ShareLocation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Яаралтай мэдээлэл", robots: { index: false, follow: false } };

const L = (en: boolean, mn: string, e: string) => (en ? e : mn);

export default async function EmergencyPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { token } = await params;
  const en = (await searchParams).lang === "en";
  const card = /^[A-Za-z0-9_-]{16,40}$/.test(token) ? await prisma.card.findUnique({ where: { token } }) : null;

  if (!card) return <Shell en={en} token={token}><Notice en={en} title={L(en, "Карт олдсонгүй", "Card not found")} text={L(en, "Энэ QR код хүчингүй эсвэл шинэчлэгдсэн байна.", "This QR code is invalid or has been replaced.")} /></Shell>;

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === card.userId;
  const { ip, userAgent } = await getClientInfo();
  const expired = !!card.expiresAt && card.expiresAt < new Date();
  const unlocked = await hasUnlock(card.id, card.rotatedAt);

  if (!isOwner && !unlocked) {
    await prisma.accessLog.create({
      data: { cardId: card.id, event: card.active && !expired ? "view" : "blocked", ipHash: hashIp(ip), ipMasked: maskIp(ip), userAgent },
    });
  }

  if (!card.active || expired)
    return <Shell en={en} token={token}><Notice en={en} title={L(en, "Карт идэвхгүй байна", "Card is inactive")} text={L(en, "Эзэмшигч энэ картыг түр идэвхгүй болгосон байна. Яаралтай үед 103 руу залгана уу.", "The owner has deactivated this card. In an emergency call 103.")} /></Shell>;

  const med = await getMedical(card.userId);
  const vis = normalizeVisibility(card.visibility);
  const can = (k: FieldKey) => vis[k] === "public" || (vis[k] === "pin" && (unlocked || isOwner));
  const label = (k: FieldKey) => { const f = FIELDS.find((x) => x.key === k)!; return en ? f.en : f.mn; };
  const hasValue: Record<FieldKey, boolean> = {
    fullName: !!med.fullName, birthDate: !!med.birthDate, gender: !!med.gender, bloodType: !!med.bloodType,
    allergies: !!med.allergies, conditions: !!med.conditions, medications: !!med.medications, contacts: med.contacts.length > 0,
    organDonor: !!med.organDonor, body: !!(med.heightCm || med.weightKg), doctor: !!(med.doctorName || med.doctorPhone),
    insuranceNo: !!med.insuranceNo, notes: !!med.notes, registerNo: !!med.registerNo, address: !!med.address,
  };
  const lockedCount = FIELDS.filter((f) => vis[f.key] === "pin" && hasValue[f.key] && !can(f.key)).length;
  const age = ageFrom(med.birthDate);
  const contacts = can("contacts") ? med.contacts : [];

  return (
    <Shell en={en} token={token}>
      {isOwner && (
        <div className="mb-4 rounded-xl bg-sky-50 p-3 text-center text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
          👁 {L(en, "Энэ бол таны картын харагдац. PIN талбарууд танд нээлттэй харагдаж байна; таны үзэлт бүртгэгдэхгүй.", "This is your own card preview.")}
        </div>
      )}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-900">
        <div className="bg-brand-600 px-6 py-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">{L(en, "Яаралтай эмнэлгийн мэдээлэл", "Emergency medical information")}</p>
          <h1 className="mt-1 text-2xl font-extrabold">{can("fullName") && med.fullName ? med.fullName : L(en, "Нэр нууцлагдсан", "Name hidden")}</h1>
          <p className="text-sm opacity-90">
            {[can("birthDate") && age !== null ? L(en, `${age} настай`, `${age} years old`) : null,
              can("gender") && med.gender ? (en ? ({ Эрэгтэй: "Male", Эмэгтэй: "Female", Бусад: "Other" } as Record<string, string>)[med.gender] : med.gender) : null]
              .filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:103" className="btn-primary py-4 text-base"><IconPhone /> {L(en, "103 залгах", "Call 103")}</a>
            {contacts[0] ? (
              <a href={`tel:${contacts[0].phone.replace(/[^+\d]/g, "")}`} className="btn-secondary py-4 text-base"><IconPhone /> {contacts[0].relation || contacts[0].name}</a>
            ) : <a href="tel:105" className="btn-secondary py-4 text-base"><IconPhone /> 105</a>}
          </div>

          {can("bloodType") && med.bloodType && (
            <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4 dark:bg-brand-900/20">
              <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><IconDrop className="h-5 w-5 text-brand-600" />{label("bloodType")}</span>
              <span className="text-3xl font-black text-brand-600">{med.bloodType}</span>
            </div>
          )}

          {can("allergies") && med.allergies && (
            <Block tone="warn" icon={<IconAlert />} title={label("allergies")}>{med.allergies}</Block>
          )}
          {can("conditions") && med.conditions && <Block icon={<IconHeart />} title={label("conditions")}>{med.conditions}</Block>}
          {can("medications") && med.medications && <Block icon={<IconPill />} title={label("medications")}>{med.medications}</Block>}

          {contacts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-2 font-bold">{label("contacts")}</p>
              <ul className="space-y-2">
                {contacts.map((c, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <div><p className="font-semibold">{c.name}</p><p className="text-xs text-slate-500">{c.relation}</p></div>
                    <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="btn-secondary !py-2 text-xs"><IconPhone className="h-4 w-4" />{c.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {can("organDonor") && med.organDonor && <Item k={label("organDonor")} v={med.organDonor === "yes" ? L(en, "Тийм", "Yes") : L(en, "Үгүй", "No")} />}
            {can("body") && (med.heightCm || med.weightKg) && <Item k={label("body")} v={`${med.heightCm || "—"} см / ${med.weightKg || "—"} кг`} />}
            {can("insuranceNo") && med.insuranceNo && <Item k={label("insuranceNo")} v={med.insuranceNo} />}
            {can("registerNo") && med.registerNo && <Item k={label("registerNo")} v={med.registerNo} />}
            {can("doctor") && (med.doctorName || med.doctorPhone) && (
              <Item k={label("doctor")} v={<>{med.doctorName}{med.doctorPhone && <a className="block text-brand-600" href={`tel:${med.doctorPhone.replace(/[^+\d]/g, "")}`}>{med.doctorPhone}</a>}</>} />
            )}
            {can("address") && med.address && <Item k={label("address")} v={med.address} />}
          </dl>
          {can("notes") && med.notes && <Block icon={<IconUser />} title={label("notes")}>{med.notes}</Block>}

          {lockedCount > 0 && card.pinHash && !isOwner && <PinUnlock token={token} count={lockedCount} en={en} />}
          {unlocked && !isOwner && <p className="text-center text-xs text-emerald-600">🔓 {L(en, "PIN-ээр нээгдсэн (10 минут хүчинтэй)", "Unlocked with PIN (valid for 10 minutes)")}</p>}

          <ShareLocation phone={contacts[0]?.phone} name={can("fullName") ? med.fullName : ""} en={en} />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        {L(en, "Энэ хуудсыг нээсэн тань хандалтын түүхэд бүртгэгдэж, эзэмшигч харах боломжтой. Мэдээллийг зөвхөн тусламж үзүүлэх зорилгоор ашиглана уу.",
          "This access is logged and visible to the card owner. Use this information only to provide help.")}
      </p>
    </Shell>
  );
}

function Shell({ children, en, token }: { children: React.ReactNode; en: boolean; token: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-6 dark:from-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-extrabold"><LogoMark className="h-6 w-6" /> MediPass</Link>
          <div className="flex rounded-full bg-white p-0.5 text-xs font-bold shadow-sm dark:bg-slate-800">
            <a href={`/e/${token}`} className={`rounded-full px-3 py-1 ${!en ? "bg-brand-600 text-white" : ""}`}>MN</a>
            <a href={`/e/${token}?lang=en`} className={`rounded-full px-3 py-1 ${en ? "bg-brand-600 text-white" : ""}`}>EN</a>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Notice({ title, text, en }: { title: string; text: string; en: boolean }) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">
      <IconAlert className="mx-auto h-12 w-12 text-amber-500" />
      <h1 className="mt-4 text-xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
      <a href="tel:103" className="btn-primary mt-6 w-full py-4 text-base"><IconPhone /> {en ? "Call 103" : "103 залгах"}</a>
    </div>
  );
}

function Block({ title, icon, children, tone }: { title: string; icon: React.ReactNode; children: React.ReactNode; tone?: "warn" }) {
  const cls = tone === "warn"
    ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
    : "border-slate-200 dark:border-slate-700";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="flex items-center gap-2 font-bold">{icon}{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm">{children}</p>
    </div>
  );
}

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>;
}
