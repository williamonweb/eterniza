import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/password";
import { publicUser, setSessionCookie } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const user = await prisma.user.findUnique({
      where: { email },
      include: { clinic: true },
    });

    if (!user || !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role))) {
      return NextResponse.json({ ok: false, message: "Acesso de clínica não encontrado." }, { status: 401 });
    }
    if (user.isActive === false) {
      return NextResponse.json({ ok: false, message: "Seu acesso está desativado. Fale com o administrador da clínica." }, { status: 403 });
    }
    if (!(await verifyPassword(password, user.password))) {
      return NextResponse.json({ ok: false, message: "Senha incorreta." }, { status: 401 });
    }
    if (!user.clinic) {
      return NextResponse.json({ ok: false, message: "Este usuário não está vinculado a uma clínica." }, { status: 403 });
    }

    const status = user.clinic.status;
    const messages = {
      PENDING: "O cadastro da clínica ainda está em análise.",
      REJECTED: "O cadastro não foi aprovado. Entre em contato com o Eterniza.",
      SUSPENDED: "O acesso da clínica está temporariamente suspenso.",
    };
    if (status !== "APPROVED") {
      return NextResponse.json({ ok: false, status, message: messages[status] || "A clínica não está liberada para acesso." }, { status: 403 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await setSessionCookie(user);

    return NextResponse.json({
      ok: true,
      user: publicUser(user),
      clinic: {
        id: user.clinic.id,
        code: user.clinic.code,
        tradeName: user.clinic.tradeName,
        status: user.clinic.status,
      },
    });
  } catch (error) {
    console.error("[pets/login]", error);
    return NextResponse.json({ ok: false, message: error.message || "Erro ao entrar." }, { status: 500 });
  }
}
