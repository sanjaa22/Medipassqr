// ENCRYPTION_KEY солих: бүх эрүүл мэндийн профайлыг шинэ түлхүүрээр дахин шифрлэнэ.
//
// Алхам:
//   1) .env-д:  ENCRYPTION_KEY_OLD="<одоогийн түлхүүр>"   ENCRYPTION_KEY="<шинэ түлхүүр>"
//      Шинэ түлхүүр үүсгэх:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//   2) npm run rotate-key
//   3) Амжилттай дууссаны дараа .env-ээс ENCRYPTION_KEY_OLD-ийг устгана (Vercel дээр бол орчны хувьсагчдаа мөн адил шинэчилнэ).
//
// ⚠ Эхлэхээс өмнө өгөгдлийн сангийнхаа нөөц хуулбарыг (backup) аваарай.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const hex = (name) => {
  const v = process.env[name] ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(v)) { console.error(`✖ ${name} нь 64 тэмдэгттэй hex байх ёстой`); process.exit(1); }
  return Buffer.from(v, "hex");
};
const NEW = hex("ENCRYPTION_KEY");
const OLD = hex("ENCRYPTION_KEY_OLD");
if (NEW.equals(OLD)) { console.error("✖ Шинэ болон хуучин түлхүүр ижил байна"); process.exit(1); }

function decryptWith(key, payload) {
  const [v, iv, tag, enc] = payload.split(".");
  if (v !== "v1" || !iv || !tag || !enc) throw new Error("формат буруу");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(enc, "base64url")), d.final()]).toString("utf8");
}
function encryptWith(key, plain) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

const prisma = new PrismaClient();
const rows = await prisma.profile.findMany({ select: { id: true, encData: true } });
let migrated = 0, already = 0, failed = 0;
for (const r of rows) {
  let plain;
  try { plain = decryptWith(NEW, r.encData); already++; continue; } catch { /* шинэ түлхүүрээр биш — хуучнаар оролдоно */ }
  try { plain = decryptWith(OLD, r.encData); } catch { failed++; console.error(`✖ Профайл ${r.id}: аль ч түлхүүрээр тайлагдсангүй`); continue; }
  await prisma.profile.update({ where: { id: r.id }, data: { encData: encryptWith(NEW, plain) } });
  migrated++;
}
console.log(`✔ Дахин шифрлэсэн: ${migrated} · Аль хэдийн шинэ түлхүүртэй: ${already} · Алдаатай: ${failed}`);
await prisma.$disconnect();
process.exit(failed ? 1 : 0);
