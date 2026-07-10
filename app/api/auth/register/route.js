import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/password";
import { publicUser, setSessionCookie } from "../../../../lib/auth";

function normalizeCpf(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function isValidCpf(value) {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (length) => {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }

    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || body.whatsapp || "").trim();
    const cpf = normalizeCpf(body.cpf);
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

    if (!isValidCpf(cpf)) {
      return NextResponse.json(
        { ok: false, message: "Informe um CPF válido para concluir o cadastro." },
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

    const existingCpf = await prisma.user.findFirst({
      where: { cpf },
      select: { id: true },
    });

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
        cpf,
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
