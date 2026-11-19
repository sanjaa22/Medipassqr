import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { readSession } from "./session";

/** Одоогийн нэвтэрсэн хэрэглэгч (сешний хувилбарыг DB-тэй тулгана) */
export const getCurrentUser = cache(async () => {
  const s = await readSession();
  if (!s) return null;
  const user = await prisma.user.findUnique({
    where: { id: s.sub },
    select: { id: true, email: true, name: true, sessionVersion: true, createdAt: true },
  });
  if (!user || user.sessionVersion !== s.v) return null;
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
