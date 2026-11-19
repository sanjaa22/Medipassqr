import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Нууц үг дор хаяж 8 тэмдэгт байна")
  .max(72, "Нууц үг хэт урт байна")
  .regex(/[A-Za-zА-Яа-яӨөҮүЁё]/, "Нууц үгэнд үсэг орсон байх ёстой")
  .regex(/\d/, "Нууц үгэнд тоо орсон байх ёстой");
