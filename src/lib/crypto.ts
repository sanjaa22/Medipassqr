import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * AES-256-GCM шифрлэлт.
 * Хадгалах формат:  v1.<iv base64url>.<authTag base64url>.<ciphertext base64url>
 */
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("ENCRYPTION_KEY нь 64 тэмдэгттэй hex (32 байт) байх ёстой");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

export function decrypt(payload: string): string {
  const [v, ivB, tagB, encB] = payload.split(".");
  if (v !== "v1" || !ivB || !tagB || !encB) throw new Error("Шифрлэгдсэн өгөгдлийн формат буруу");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encB, "base64url")), decipher.final()]).toString("utf8");
}

/** QR-д орох таамаглах боломжгүй токен (128 бит) */
export function newCardToken(): string {
  return randomBytes(16).toString("base64url");
}

/** IP хаягийг шууд хадгалахгүй — давс нэмсэн SHA-256 хэш */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${ip}|${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
}

export function maskIp(ip: string): string {
  if (ip.includes(".")) {
    const p = ip.split(".");
    return `${p[0]}.${p[1]}.*.*`;
  }
  if (ip.includes(":")) {
    const p = ip.split(":");
    return `${p[0]}:${p[1] ?? ""}:****`;
  }
  return "тодорхойгүй";
}
