import "server-only";

/**
 * Имэйл илгээх (Resend API — https://resend.com, үнэгүй багц байдаг).
 * Тохиргоо: .env-д RESEND_API_KEY ба MAIL_FROM (жишээ: "MediPass <no-reply@таны-домэйн.mn>").
 * Тохиргоогүй үед (локал хөгжүүлэлт) имэйлийг илгээхгүй, харин СЕРВЕРИЙН ТЕРМИНАЛД хэвлэнэ.
 */
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV === "production") {
      console.error("[medipass] RESEND_API_KEY / MAIL_FROM тохируулаагүй тул имэйл илгээгдсэнгүй");
      return false;
    }
    console.log(`\n[medipass:mail] → ${to}\n  Гарчиг: ${subject}\n${text.split("\n").map((l) => "  " + l).join("\n")}\n`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) console.error("[medipass] имэйл илгээж чадсангүй:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[medipass] имэйл илгээх алдаа:", (e as Error).message);
    return false;
  }
}
