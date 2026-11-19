"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children, className = "btn-primary", pendingText = "Түр хүлээнэ үү…", ...rest
}: { children: React.ReactNode; className?: string; pendingText?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} {...rest}>
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {pending ? pendingText : children}
    </button>
  );
}
