import { z } from "zod";

/** Хамгийн түгээмэл (хакеруудын эхэлж туршдаг) нууц үгс — үсэг+тоо шаардлагыг хангадаг тул тусад нь хаана */
const COMMON = new Set([
  "password1", "password12", "password123", "passw0rd", "qwerty123", "qwerty12", "qwertyui1", "1qaz2wsx",
  "1q2w3e4r", "abc12345", "abcd1234", "admin123", "letmein1", "welcome1", "welcome123", "iloveyou1",
  "medipass1", "medipass123", "monkey123", "dragon123", "football1", "baseball1", "sunshine1", "princess1",
  "a1234567", "a12345678", "aa123456", "asdf1234", "zxcvbnm1", "mongolia1", "ulaanbaatar1",
]);

export const passwordSchema = z
  .string()
  .min(8, "Нууц үг дор хаяж 8 тэмдэгт байна")
  .max(72, "Нууц үг хэт урт байна")
  .regex(/[A-Za-zА-Яа-яӨөҮүЁё]/, "Нууц үгэнд үсэг орсон байх ёстой")
  .regex(/\d/, "Нууц үгэнд тоо орсон байх ёстой")
  .refine((v) => !COMMON.has(v.toLowerCase()) && !/^(.)\1+$/.test(v), "Энэ нууц үг хэт түгээмэл, амархан таагдана. Өөр нууц үг сонгоно уу");
