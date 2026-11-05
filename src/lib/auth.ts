import { cookies } from "next/headers";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSessionToken, verifySessionToken } from "./session";

export type Plan = "FREE" | "PRO";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  plan: Plan;
}

export async function createSession(userId: string): Promise<void> {
  const token = await signSessionToken(userId);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, plan: true },
  });
  if (!user) return null;

  return { ...user, plan: user.plan === "PRO" ? "PRO" : "FREE" };
}
