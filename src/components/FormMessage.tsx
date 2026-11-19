export type FormState = { ok?: boolean; error?: string; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

export default function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error)
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{state.error}</div>;
  if (state.message)
    return <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">{state.message}</div>;
  return null;
}
