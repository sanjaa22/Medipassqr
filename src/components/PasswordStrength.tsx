"use client";

export function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-zа-яөүё]/.test(pw) && /[A-ZА-ЯӨҮЁ]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-zА-Яа-яӨөҮүЁё0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

const LABELS = ["Маш сул", "Сул", "Дунд", "Сайн", "Маш сайн"];
const COLORS = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return <p className="hint">Дор хаяж 8 тэмдэгт, үсэг ба тоо орсон байна.</p>;
  const s = scorePassword(value);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? COLORS[s] : "bg-slate-200 dark:bg-slate-800"}`} />
        ))}
      </div>
      <p className="hint">Нууц үгийн хүч: <b>{LABELS[s]}</b></p>
    </div>
  );
}
