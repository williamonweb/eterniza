import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

function adminLevel(user) {
  if (!user || user.role !== "ADMIN") return null;
  return String(user.permissions?.adminLevel || "SUPER_ADMIN").toUpperCase();
}

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  return adminLevel(user) === "SUPER_ADMIN" ? user : null;
}

function serialize(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    isActive: user.isActive !== false,
    adminLevel: adminLevel(user) || "ADMIN",
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Acesso restrito ao Super Admin." }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      permissions: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, users: users.map(serialize), currentUserId: admin.id });
}

export async function POST(request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Acesso restrito ao Super Admin." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim() || null;
  const password = String(body.password || "");
  const level = String(body.adminLevel || "ADMIN").toUpperCase();

  if (!name || !email || !password) {
    return NextResponse.json({ ok: false, message: "Preencha nome, e-mail e senha." }, { status: 400 });
  }
  if (!email.includes("@")) return NextResponse.json({ ok: false, message: "Informe um e-mail válido." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ ok: false, message: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  if (!["SUPER_ADMIN", "ADMIN", "ATTENDANT"].includes(level)) {
    return NextResponse.json({ ok: false, message: "Perfil administrativo inválido." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ ok: false, message: "Já existe um usuário com esse e-mail." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
      isActive: true,
      permissions: { adminLevel: level },
    },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      permissions: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, user: serialize(user), message: "Usuário administrativo criado." }, { status: 201 });
}

export async function PATCH(request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Acesso restrito ao Super Admin." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "ADMIN") return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });

  const data = {};
  if (body.name !== undefined) data.name = String(body.name || "").trim();
  if (body.phone !== undefined) data.phone = String(body.phone || "").trim() || null;
  if (body.adminLevel !== undefined) {
    const level = String(body.adminLevel).toUpperCase();
    if (!["SUPER_ADMIN", "ADMIN", "ATTENDANT"].includes(level)) return NextResponse.json({ ok: false, message: "Perfil inválido." }, { status: 400 });
    data.permissions = { ...(target.permissions || {}), adminLevel: level };
  }
  if (body.isActive !== undefined) {
    if (target.id === admin.id && body.isActive === false) return NextResponse.json({ ok: false, message: "Você não pode bloquear seu próprio acesso." }, { status: 400 });
    data.isActive = Boolean(body.isActive);
  }
  if (body.password) {
    const password = String(body.password);
    if (password.length < 8) return NextResponse.json({ ok: false, message: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
    data.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id }, data,
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      permissions: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
  });
  return NextResponse.json({ ok: true, user: serialize(user), message: "Usuário atualizado." });
}
