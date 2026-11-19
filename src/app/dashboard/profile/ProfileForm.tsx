"use client";
import { useActionState, useState } from "react";
import { saveProfileAction } from "@/app/actions/dashboard";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import { BLOOD_TYPES } from "@/lib/fields";
import type { MedicalData } from "@/lib/profile";

const ALLERGY_HINTS = ["Пенициллин", "Аспирин", "Самар", "Өндөг", "Сүү", "Далайн хоол", "Зөгийн хор", "Латекс", "Йод", "Байхгүй"];
const CONDITION_HINTS = ["Чихрийн шижин", "Даралт ихсэх", "Астма", "Эпилепси", "Зүрхний өвчин", "Бөөрний дутагдал", "Жирэмсэн", "Байхгүй"];

type Contact = MedicalData["contacts"][number] & { id: number };
let seq = 0;
const blank = (): Contact => ({ id: ++seq, name: "", relation: "", phone: "" });

export default function ProfileForm({ initial }: { initial: MedicalData }) {
  const [state, action] = useActionState(saveProfileAction, undefined);
  const [contacts, setContacts] = useState<Contact[]>(() => initial.contacts.length ? initial.contacts.map((c) => ({ ...c, id: ++seq })) : [blank()]);
  const [allergies, setAllergies] = useState(initial.allergies);
  const [conditions, setConditions] = useState(initial.conditions);

  const addTag = (cur: string, tag: string) => {
    const parts = cur.split(",").map((s) => s.trim()).filter(Boolean);
    if (tag === "Байхгүй") return "Байхгүй";
    const clean = parts.filter((p) => p !== "Байхгүй");
    return clean.includes(tag) ? clean.filter((p) => p !== tag).join(", ") : [...clean, tag].join(", ");
  };

  return (
    <form action={action} className="space-y-6">
      <Section title="Хувийн мэдээлэл" desc="Таныг таньж мэдэхэд шаардлагатай үндсэн мэдээлэл.">
        <Field label="Овог нэр" className="sm:col-span-2"><input name="fullName" className="input" defaultValue={initial.fullName} placeholder="Ганболдын Бат-Эрдэнэ" /></Field>
        <Field label="Төрсөн огноо"><input name="birthDate" type="date" className="input" defaultValue={initial.birthDate} max={new Date().toISOString().slice(0, 10)} /></Field>
        <Field label="Хүйс">
          <select name="gender" className="input" defaultValue={initial.gender}>
            <option value="">Сонгох</option><option>Эрэгтэй</option><option>Эмэгтэй</option><option>Бусад</option>
          </select>
        </Field>
        <Field label="Регистрийн дугаар" hint="Анхдагч байдлаар нуусан байна."><input name="registerNo" className="input uppercase" defaultValue={initial.registerNo} placeholder="УБ90010112" maxLength={10} /></Field>
        <Field label="Гэрийн хаяг"><input name="address" className="input" defaultValue={initial.address} placeholder="БЗД, 26-р хороо, ..." /></Field>
      </Section>

      <Section title="Эмнэлгийн гол мэдээлэл" desc="Яаралтай тусламжийн үед хамгийн түрүүнд хэрэгтэй мэдээлэл.">
        <Field label="Цусны бүлэг">
          <select name="bloodType" className="input" defaultValue={initial.bloodType}>
            <option value="">Сонгох</option>{BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Өндөр (см)"><input name="heightCm" inputMode="numeric" className="input" defaultValue={initial.heightCm} placeholder="175" /></Field>
          <Field label="Жин (кг)"><input name="weightKg" inputMode="decimal" className="input" defaultValue={initial.weightKg} placeholder="70" /></Field>
        </div>
        <Field label="Харшил" className="sm:col-span-2" hint="Эм, хоол хүнс, бусад. Байхгүй бол “Байхгүй” гэж бичнэ үү.">
          <textarea name="allergies" rows={2} className="input" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Пенициллин, самар" />
          <Chips items={ALLERGY_HINTS} value={allergies} onPick={(t) => setAllergies(addTag(allergies, t))} />
        </Field>
        <Field label="Архаг өвчин / эрүүл мэндийн байдал" className="sm:col-span-2">
          <textarea name="conditions" rows={2} className="input" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Чихрийн шижин II хэв шинж" />
          <Chips items={CONDITION_HINTS} value={conditions} onPick={(t) => setConditions(addTag(conditions, t))} />
        </Field>
        <Field label="Байнга хэрэглэдэг эм" className="sm:col-span-2" hint="Эмийн нэр, тун, хэрэглэх давтамж.">
          <textarea name="medications" rows={3} className="input" defaultValue={initial.medications} placeholder="Метформин 500мг — өдөрт 2 удаа" />
        </Field>
        <Field label="Эрхтэн хандивлагч">
          <select name="organDonor" className="input" defaultValue={initial.organDonor}>
            <option value="">Тодорхойгүй</option><option value="yes">Тийм</option><option value="no">Үгүй</option>
          </select>
        </Field>
        <Field label="ЭМД-ын дугаар"><input name="insuranceNo" className="input" defaultValue={initial.insuranceNo} /></Field>
      </Section>

      <Section title="Яаралтай холбоо барих хүмүүс" desc="Дээд тал нь 5 хүн. Эхний хүн рүү байршил илгээх товч ажиллана.">
        <div className="space-y-3 sm:col-span-2">
          {contacts.map((c) => (
            <div key={c.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_140px_1fr_auto]">
              <input name="c_name" className="input" placeholder="Нэр" defaultValue={c.name} aria-label="Нэр" />
              <input name="c_relation" className="input" placeholder="Хамаарал (ээж)" defaultValue={c.relation} aria-label="Хамаарал" />
              <input name="c_phone" type="tel" className="input" placeholder="+976 9911 2233" defaultValue={c.phone} aria-label="Утас" />
              <button type="button" className="btn-ghost text-red-600" onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))} aria-label="Устгах">✕</button>
            </div>
          ))}
          {contacts.length < 5 && (
            <button type="button" className="btn-secondary" onClick={() => setContacts([...contacts, blank()])}>+ Хүн нэмэх</button>
          )}
        </div>
      </Section>

      <Section title="Эмчлэгч эмч ба нэмэлт" desc="">
        <Field label="Эмчийн нэр"><input name="doctorName" className="input" defaultValue={initial.doctorName} placeholder="Д. Сарантуяа (Улсын 1-р эмнэлэг)" /></Field>
        <Field label="Эмчийн утас"><input name="doctorPhone" type="tel" className="input" defaultValue={initial.doctorPhone} /></Field>
        <Field label="Нэмэлт тэмдэглэл" className="sm:col-span-2" hint="Жишээ: зүрхний аппараттай, контакт линз зүүдэг, шашны итгэл үнэмшил г.м.">
          <textarea name="notes" rows={3} className="input" defaultValue={initial.notes} />
        </Field>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center">
        <div className="flex-1"><FormMessage state={state} /></div>
        <SubmitButton>Хадгалах</SubmitButton>
      </div>
    </form>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="h-section">{title}</h2>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><label className="label">{label}</label>{children}{hint && <p className="hint">{hint}</p>}</div>;
}
function Chips({ items, value, onPick }: { items: string[]; value: string; onPick: (t: string) => void }) {
  const cur = value.split(",").map((s) => s.trim());
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <button type="button" key={t} onClick={() => onPick(t)}
          className={`rounded-full border px-2.5 py-1 text-xs transition ${cur.includes(t) ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-400"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
