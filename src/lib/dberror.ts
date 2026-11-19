import "server-only";

/**
 * Өгөгдлийн сан / тохиргооны алдааг хэрэглэгчид ойлгомжтой мессеж болгон хөрвүүлнэ.
 * (Өмнө нь ийм алдаа гарвал хуудас шууд "алдаа" харуулдаг, шалтгаан нь мэдэгддэггүй байсан.)
 */
export function explainServerError(e: unknown): string {
  const err = e as { code?: string; message?: string; name?: string };
  const msg = String(err?.message ?? "");
  console.error("[medipass]", err?.name, err?.code, msg);

  if (msg.includes("AUTH_SECRET")) return "Серверийн тохиргоо дутуу: .env дотор AUTH_SECRET (32+ тэмдэгт) тавина уу. `npm run setup` ажиллуулбал автоматаар үүснэ.";
  if (msg.includes("ENCRYPTION_KEY")) return "Серверийн тохиргоо дутуу: .env дотор ENCRYPTION_KEY (64 hex) тавина уу. `npm run setup` ажиллуулбал автоматаар үүснэ.";
  if (err?.code === "P2021" || err?.code === "P2022" || /does not exist in the current database/i.test(msg))
    return "Өгөгдлийн сангийн хүснэгтүүд үүсээгүй байна. Терминалд `npm run setup` (эсвэл `npx prisma db push`) ажиллуулна уу.";
  if (["P1000", "P1001", "P1002", "P1003", "P1017"].includes(err?.code ?? "") || /Can't reach database|Environment variable not found: DATABASE_URL|ECONNREFUSED/i.test(msg))
    return "Өгөгдлийн сантай холбогдож чадсангүй. .env доторх DATABASE_URL зөв эсэх, PostgreSQL ажиллаж байгаа эсэхийг шалгана уу.";
  return "Серверт алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.";
}
