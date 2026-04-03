import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-only-fallback-secret";
}

function sign(raw: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(raw)
    .digest("hex");
}

function createSessionValue(userId: number) {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const raw = `${userId}.${expiresAt}`;
  const signature = sign(raw);
  return `${raw}.${signature}`;
}

function parseSessionValue(value: string | undefined) {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userIdRaw, expiresAtRaw, signature] = parts;
  const raw = `${userIdRaw}.${expiresAtRaw}`;
  const expectedSignature = sign(raw);

  if (signature !== expectedSignature) return null;

  const userId = Number(userIdRaw);
  const expiresAt = Number(expiresAtRaw);

  if (Number.isNaN(userId) || Number.isNaN(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  return { userId };
}

export function setSessionCookie(userId: number) {
  cookies().set(COOKIE_NAME, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  const parsed = parseSessionValue(value);

  if (!parsed) return null;

  return prisma.user.findUnique({
    where: { id: parsed.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true
    }
  });
}