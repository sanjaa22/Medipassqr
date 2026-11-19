"use client";
import { useActionState } from "react";
import { unlockAction } from "./actions";
import SubmitButton from "@/components/SubmitButton";
import { IconLock } from "@/components/Icons";

export default function PinUnlock({ token, count, en }: { token: string; count: number; en: boolean }) {
  const [state, action] = useActionState(unlockAction, undefined);
  return (
    <form action={action} className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
        <IconLock /> {en ? `${count} more fields are PIN-protected` : `${count} мэдээлэл PIN-ээр хамгаалагдсан`}
      </div>
      <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
        {en ? "Family members and doctors who know the PIN can unlock them for 10 minutes." : "PIN мэдэх ар гэрийнхэн, эмч 10 минутын турш нээж харах боломжтой."}
      </p>
      <input type="hidden" name="token" value={token} />
      <div className="mt-4 flex gap-2">
        <input name="pin" type="password" inputMode="numeric" pattern="\d{4,6}" maxLength={6} required autoComplete="off"
          className="input flex-1 text-center text-lg tracking-[.5em]" placeholder="••••" aria-label="PIN" />
        <SubmitButton className="btn bg-amber-500 text-white hover:bg-amber-600" pendingText="…">{en ? "Unlock" : "Нээх"}</SubmitButton>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{state.error}</p>}
    </form>
  );
}
