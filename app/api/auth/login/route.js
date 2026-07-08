import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/password";
import { publicUser, setSessionCookie } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email.includes("@") || !password) {
      return NextResponse.json({ ok: false, message: "Informe e-mail e senha." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "Conta não encontrada." }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, message: "Senha incorreta." }, { status: 401 });
    }

    await setSessionCookie(user);
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || "Erro ao entrar." }, { status: 500 });
  }
}
