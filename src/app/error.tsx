"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl">⚠️</p>
      <h1 className="mt-4 text-xl font-bold">Алдаа гарлаа</h1>
      <p className="mt-2 text-slate-500">Түр хүлээгээд дахин оролдоно уу. Яаралтай үед 103 руу залгана уу.</p>
      <button onClick={reset} className="btn-primary mt-6">Дахин оролдох</button>
    </div>
  );
}
