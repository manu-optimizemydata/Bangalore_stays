import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "bs_owner_session";
const SESSION_DAYS = 30;

function sessionSecret() {
  const value = process.env.OWNER_SESSION_SECRET;
  if (!value) {
    throw new Error("OWNER_SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function hashOwnerPassword(password: string) {
  return hash(password, 12);
}

export async function ownerPasswordMatches(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createOwnerSession(ownerId: string) {
  const token = await new SignJWT({ ownerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearOwnerSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getOwnerSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const ownerId = typeof payload.ownerId === "string" ? payload.ownerId : null;
    if (!ownerId) return null;

    return prisma.owner.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });
  } catch {
    return null;
  }
}
