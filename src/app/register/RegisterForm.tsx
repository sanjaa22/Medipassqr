"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "../actions/auth";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import PasswordStrength from "@/components/PasswordStrength";
import { IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconCheck } from "@/components/Icons";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{msg}</p>;
}

function Req({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 transition-colors ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full ${ok ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>
        {ok && <IconCheck className="h-3 w-3" />}
      </span>
      {children}
    </li>
  );
}

export default function RegisterForm() {
  const [state, action] = useActionState(registerAction, undefined);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const fe = state?.fieldErrors ?? {};

  const hasLen = pw.length >= 8;
  const hasLetter = /[A-Za-zА-Яа-яӨөҮүЁё]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const matches = confirm.length > 0 && pw === confirm;
  const mismatch = confirm.length > 0 && pw !== confirm;

  return (
    <form action={action} className="space-y-5" noValidate={false}>
      <FormMessage state={state} />

      <div>
        <label className="label" htmlFor="name">Таны нэр</label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><IconUser className="h-[18px] w-[18px]" /></span>
          <input className="input pl-10" id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" placeholder="Бат-Эрдэнэ"
            defaultValue={state?.values?.name ?? ""} aria-invalid={!!fe.name} />
        </div>
        <FieldError msg={fe.name} />
      </div>

      <div>
        <label className="label" htmlFor="email">Имэйл хаяг</label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><IconMail className="h-[18px] w-[18px]" /></span>
          <input className="input pl-10" id="email" name="email" type="email" required autoComplete="email" placeholder="bat@example.com"
            defaultValue={state?.values?.email ?? ""} aria-invalid={!!fe.email} />
        </div>
        <FieldError msg={fe.email} />
      </div>

      <div>
        <label className="label" htmlFor="password">Нууц үг</label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><IconLock className="h-[18px] w-[18px]" /></span>
          <input className="input px-10" id="password" name="password" type={showPw ? "text" : "password"} required minLength={8} maxLength={72}
            autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!fe.password} />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label={showPw ? "Нууц үг нуух" : "Нууц үг харах"}>
            {showPw ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
          </button>
        </div>
        <FieldError msg={fe.password} />
        <PasswordStrength value={pw} />
        <ul className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-3">
          <Req ok={hasLen}>8+ тэмдэгт</Req>
          <Req ok={hasLetter}>Үсэг</Req>
          <Req ok={hasDigit}>Тоо</Req>
        </ul>
      </div>

      <div>
        <label className="label" htmlFor="confirm">Нууц үг давтах</label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><IconLock className="h-[18px] w-[18px]" /></span>
          <input className={`input pl-10 ${mismatch ? "!border-red-400 focus:!ring-red-500/30" : matches ? "!border-emerald-400" : ""}`}
            id="confirm" name="confirm" type={showPw ? "text" : "password"} required autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch || !!fe.confirm} />
        </div>
        {mismatch && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">Нууц үг таарахгүй байна</p>}
        {matches && <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Таарч байна ✓</p>}
        {!mismatch && <FieldError msg={fe.confirm} />}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <input type="checkbox" name="agree" className="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-600" required />
        <span>Би <Link href="/privacy" target="_blank" className="font-semibold text-brand-600 hover:underline">нууцлалын бодлого</Link>-той танилцаж, эрүүл мэндийн мэдээллээ боловсруулахыг зөвшөөрч байна.</span>
      </label>
      <FieldError msg={fe.agree} />

      <SubmitButton className="btn-primary w-full !py-3 text-base shadow-lg shadow-brand-600/20" pendingText="Бүртгэл үүсгэж байна…">Бүртгүүлэх</SubmitButton>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Бүртгэлтэй юу? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Нэвтрэх</Link>
      </p>
    </form>
  );
}
