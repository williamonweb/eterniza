import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionMaxAgeSeconds,
  verifySessionToken,
} from "./session";

export { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    whatsapp: user.phone || "",
    role: user.role === "ADMIN" ? "admin" : "cliente",
    roleKey: user.role,
  };
}

export async function setSessionCookie(user) {
  const token = await createSessionToken(user);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
