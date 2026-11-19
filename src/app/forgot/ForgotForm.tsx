"use client";
import { useActionState } from "react";
import Link from "next/link";
import { requestResetAction } from "../actions/password";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";

export default function ForgotForm() {
  const [state, action] = useActionState(requestResetAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <div>
        <label className="label" htmlFor="email">Имэйл хаяг</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="bat@example.com" defaultValue={state?.values?.email ?? ""} />
      </div>
      <SubmitButton className="btn-primary w-full">Сэргээх холбоос илгээх</SubmitButton>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">← Нэвтрэх хуудас руу буцах</Link>
      </p>
    </form>
  );
}
