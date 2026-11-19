"use client";
import { useActionState, useState } from "react";
import { saveVisibilityAction } from "@/app/actions/dashboard";
import { FIELDS, type Visibility, type VisibilityMap } from "@/lib/fields";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";

const OPTS: { v: Visibility; label: string; cls: string }[] = [
  { v: "public", label: "Нээлттэй", cls: "peer-checked:bg-emerald-500 peer-checked:text-white" },
  { v: "pin", label: "PIN", cls: "peer-checked:bg-amber-500 peer-checked:text-white" },
  { v: "hidden", label: "Нуух", cls: "peer-checked:bg-slate-600 peer-checked:text-white" },
];

const PRESETS: Record<string, { label: string; map: (k: string, d: Visibility) => Visibility }> = {
  rec: { label: "Зөвлөмж", map: (_k, d) => d },
  open: { label: "Бүгд нээлттэй", map: (k) => (k === "registerNo" || k === "address" ? "hidden" : "public") },
  strict: { label: "Хатуу нууцлал", map: (k) => (["bloodType", "allergies", "contacts"].includes(k) ? "public" : k === "registerNo" || k === "address" ? "hidden" : "pin") },
};

export default function VisibilityForm({ initial, expiresAt, hasPin }: { initial: VisibilityMap; expiresAt: string; hasPin: boolean }) {
  const [state, action] = useActionState(saveVisibilityAction, undefined);
  const [vis, setVis] = useState<VisibilityMap>(initial);
  const apply = (key: string) => setVis(Object.fromEntries(FIELDS.map((f) => [f.key, PRESETS[key].map(f.key, f.def)])) as VisibilityMap);

  return (
    <form action={action} className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="h-section">Талбар бүрийн харагдах түвшин</h2>
        <div className="flex gap-1.5">
          {Object.entries(PRESETS).map(([k, p]) => (
            <button key={k} type="button" onClick={() => apply(k)} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium hover:border-brand-500 dark:border-slate-700">{p.label}</button>
          ))}
        </div>
      </div>
      {!hasPin && Object.values(vis).includes("pin") && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">⚠ PIN код тохируулаагүй байна. Баруун талын хэсгээс PIN тохируулахгүй бол “PIN” талбаруудыг хэн ч нээх боломжгүй.</p>
      )}
      <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
        {FIELDS.map((f) => (
          <li key={f.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{f.mn}</p>
              <p className="text-xs text-slate-500">{f.en}</p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label={f.mn}>
              {OPTS.map((o) => (
                <label key={o.v} className="cursor-pointer">
                  <input type="radio" name={`vis_${f.key}`} value={o.v} className="peer sr-only" checked={vis[f.key] === o.v}
                    onChange={() => setVis({ ...vis, [f.key]: o.v })} />
                  <span className={`block rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition dark:text-slate-300 ${o.cls} peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500`}>{o.label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
        <label className="label" htmlFor="expiresAt">Картын хүчинтэй хугацаа (заавал биш)</label>
        <input type="date" id="expiresAt" name="expiresAt" className="input max-w-xs" defaultValue={expiresAt} min={new Date().toISOString().slice(0, 10)} />
        <p className="hint">Аялал, арга хэмжээнд түр хэрэглэх бол тохируулна. Хоосон бол хугацаагүй.</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1"><FormMessage state={state} /></div>
        <SubmitButton>Тохиргоо хадгалах</SubmitButton>
      </div>
    </form>
  );
}
