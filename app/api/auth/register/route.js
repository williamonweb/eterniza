import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/password";
import { publicUser, setSessionCookie } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || body.whatsapp || "").trim();
    const password = String(body.password || "");

    if (!name || !email.includes("@") || password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Preencha nome, e-mail válido e senha com pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ ok: false, message: "Este e-mail já possui cadastro. Use Entrar." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: await hashPassword(password),
        role: "CLIENT",
      },
    });

    await setSessionCookie(user);
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || "Erro ao criar cadastro." }, { status: 500 });
  }
}
