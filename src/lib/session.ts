import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mp_session";
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET дор хаяж 32 тэмдэгт байх ёстой");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; v: number };

export async function createSession(userId: string, version: number) {
  const token = await new SignJWT({ v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub, v: Number(payload.v ?? 0) };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/* ---- PIN-ээр нээсэн яаралтай картын түр зөвшөөрөл (10 минут) ---- */
const UNLOCK_MIN = 10;
export const unlockCookieName = (cardId: string) => `mp_u_${cardId}`;

export async function grantUnlock(cardId: string, rotatedAt: Date) {
  const token = await new SignJWT({ cid: cardId, r: rotatedAt.getTime() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${UNLOCK_MIN}m`)
    .sign(secret());
  const jar = await cookies();
  jar.set(unlockCookieName(cardId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/e",
    maxAge: UNLOCK_MIN * 60,
  });
}

export async function hasUnlock(cardId: string, rotatedAt: Date) {
  const jar = await cookies();
  const t = jar.get(unlockCookieName(cardId))?.value;
  if (!t) return false;
  try {
    const { payload } = await jwtVerify(t, secret(), { algorithms: ["HS256"] });
    return payload.cid === cardId && payload.r === rotatedAt.getTime();
  } catch {
    return false;
  }
}
