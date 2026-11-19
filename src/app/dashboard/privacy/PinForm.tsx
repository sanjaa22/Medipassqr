"use client";
import { useActionState } from "react";
import { setPinAction } from "@/app/actions/dashboard";
import SubmitButton from "@/components/SubmitButton";
import FormMessage from "@/components/FormMessage";

export default function PinForm({ hasPin }: { hasPin: boolean }) {
  const [state, action] = useActionState(setPinAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <input name="pin" type="password" inputMode="numeric" pattern="\d{4,6}" maxLength={6} required className="input tracking-[.5em] placeholder:tracking-normal" placeholder={hasPin ? "Шинэ PIN" : "PIN (4–6 орон)"} aria-label="PIN" autoComplete="off" />
      <input name="pinConfirm" type="password" inputMode="numeric" pattern="\d{4,6}" maxLength={6} required className="input tracking-[.5em] placeholder:tracking-normal" placeholder="PIN давтах" aria-label="PIN давтах" autoComplete="off" />
      <SubmitButton className="btn-secondary w-full">{hasPin ? "PIN солих" : "PIN тохируулах"}</SubmitButton>
    </form>
  );
}
