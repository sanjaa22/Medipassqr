"use client";
import { useActionState, useState } from "react";
import { resetPasswordAction } from "../../actions/password";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import PasswordStrength from "@/components/PasswordStrength";
import { IconEye, IconEyeOff } from "@/components/Icons";

export default function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, undefined);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const mismatch = confirm.length > 0 && pw !== confirm;
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="password">Шинэ нууц үг</label>
        <div className="relative">
          <input className="input pr-11" id="password" name="password" type={show ? "text" : "password"} required minLength={8} maxLength={72}
            autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!fe.password} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-0 px-3 text-slate-500" aria-label={show ? "Нууц үг нуух" : "Нууц үг харах"}>
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        <PasswordStrength value={pw} />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Нууц үг давтах</label>
        <input className={`input ${mismatch ? "!border-red-400" : ""}`} id="confirm" name="confirm" type={show ? "text" : "password"} required
          autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch || !!fe.confirm} />
        {mismatch && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">Нууц үг таарахгүй байна</p>}
      </div>
      <SubmitButton className="btn-primary w-full">Нууц үг солих</SubmitButton>
    </form>
  );
}
