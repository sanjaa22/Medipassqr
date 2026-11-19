"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "../actions/auth";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import { IconEye, IconEyeOff } from "@/components/Icons";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Имэйл хаяг</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="bat@example.com" defaultValue={state?.values?.email ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="password">Нууц үг</label>
        <div className="relative">
          <input className="input pr-11" id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required />
          <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 px-3 text-slate-500" aria-label="Нууц үг харах">
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
      </div>
      <SubmitButton className="btn-primary w-full">Нэвтрэх</SubmitButton>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Бүртгэлгүй юу? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Бүртгүүлэх</Link>
      </p>
    </form>
  );
}
