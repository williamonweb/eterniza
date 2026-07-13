import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/password";
import { publicUser, setSessionCookie } from "../../../../lib/auth";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = onlyDigits(body.phone || body.whatsapp || "");
    const password = String(body.password || "");

    if (!name || !email.includes("@") || password.length < 6) {
      return NextResponse.json(
        {
          ok: false,
          message: "Preencha nome, e-mail válido e senha com pelo menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    if (phone.length !== 10 && phone.length !== 11) {
      return NextResponse.json(
        { ok: false, message: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        { ok: false, message: "Este e-mail já possui cadastro. Use Entrar." },
        { status: 409 }
      );
    }

    if (existingCpf) {
      return NextResponse.json(
        { ok: false, message: "Este CPF já está vinculado a outra conta." },
        { status: 409 }
      );
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

    return NextResponse.json({
      ok: true,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("[auth/register]", err);

    return NextResponse.json(
      { ok: false, message: "Erro ao criar cadastro. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
