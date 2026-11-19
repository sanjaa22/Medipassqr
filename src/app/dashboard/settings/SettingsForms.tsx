"use client";
import { useActionState, useState } from "react";
import { changePasswordAction, updateNameAction, deleteAccountAction } from "@/app/actions/dashboard";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";
import PasswordStrength from "@/components/PasswordStrength";

export function SettingsForms({ name }: { name: string }) {
  const [nState, nAction] = useActionState(updateNameAction, undefined);
  const [pState, pAction] = useActionState(changePasswordAction, undefined);
  const [pw, setPw] = useState("");
  return (
    <div className="space-y-6">
      <form action={nAction} className="card space-y-4 p-6">
        <h2 className="h-section">Хэрэглэгчийн нэр</h2>
        <FormMessage state={nState} />
        <input name="name" className="input" defaultValue={name} required minLength={2} />
        <SubmitButton className="btn-secondary">Хадгалах</SubmitButton>
      </form>
      <form action={pAction} className="card space-y-4 p-6">
        <h2 className="h-section">Нууц үг солих</h2>
        <FormMessage state={pState} />
        <div><label className="label">Одоогийн нууц үг</label><input name="current" type="password" className="input" required autoComplete="current-password" /></div>
        <div><label className="label">Шинэ нууц үг</label><input name="password" type="password" className="input" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /><PasswordStrength value={pw} /></div>
        <div><label className="label">Шинэ нууц үг давтах</label><input name="confirm" type="password" className="input" required autoComplete="new-password" /></div>
        <SubmitButton>Нууц үг солих</SubmitButton>
      </form>
    </div>
  );
}

export function DeleteAccount() {
  const [state, action] = useActionState(deleteAccountAction, undefined);
  const [open, setOpen] = useState(false);
  return (
    <div className="card border-red-200 p-6 dark:border-red-900/60">
      <h2 className="h-section text-red-600">Бүртгэл устгах</h2>
      <p className="mt-1 text-sm text-slate-500">Таны бүх эрүүл мэндийн мэдээлэл, QR карт, хандалтын түүх <b>бүрмөсөн</b> устна. Сэргээх боломжгүй.</p>
      {!open ? (
        <button className="btn-danger mt-4 w-full" onClick={() => setOpen(true)}>Бүртгэл устгах</button>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <FormMessage state={state} />
          <input name="confirmEmail" type="email" className="input" placeholder="Баталгаажуулахын тулд имэйлээ бичнэ үү" required />
          <input name="password" type="password" className="input" placeholder="Нууц үг" required />
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Болих</button>
            <SubmitButton className="btn-danger flex-1">Бүрмөсөн устгах</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
