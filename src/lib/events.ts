import "server-only";
import { prisma } from "./db";
import { maskIp } from "./crypto";
import { getClientInfo } from "./request";

export const EVENT_LABEL: Record<string, string> = {
  register: "Бүртгэл үүсгэсэн",
  login: "Амжилттай нэвтэрсэн",
  login_fail: "Нэвтрэх амжилтгүй оролдлого",
  locked: "Бүртгэл түр түгжигдсэн",
  logout_all: "Бүх төхөөрөмжөөс гаргасан",
  password_change: "Нууц үг сольсон",
  profile_update: "Эрүүл мэндийн мэдээлэл шинэчилсэн",
  privacy_update: "Нууцлалын тохиргоо өөрчилсөн",
  pin_set: "PIN код тохируулсан",
  pin_remove: "PIN код устгасан",
  token_rotate: "QR кодыг шинэчилсэн",
  card_toggle: "Картын төлөв өөрчилсөн",
  export: "Өгөгдөл татаж авсан",
  logs_clear: "Хандалтын түүх цэвэрлэсэн",
};

export async function logEvent(userId: string, type: string, detail = "") {
  const { ip } = await getClientInfo();
  await prisma.securityEvent.create({ data: { userId, type, detail, ipMasked: maskIp(ip) } });
}
