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
    if (!(await verifyPassword(password, user.password))) {
      return NextResponse.json({ ok: false, message: "Senha incorreta." }, { status: 401 });
    }

    if (!user.clinic) {
      return NextResponse.json({ ok: false, message: "Este usuário não está vinculado a uma clínica." }, { status: 403 });
    }

    const status = user.clinic.status;
    if (status === "PENDING") {
      return NextResponse.json({ ok: false, status, message: "O cadastro da clínica ainda está em análise." }, { status: 403 });
    }
    if (status === "REJECTED") {
      return NextResponse.json({ ok: false, status, message: "O cadastro não foi aprovado. Entre em contato com o Eterniza." }, { status: 403 });
    }
    if (status === "SUSPENDED") {
      return NextResponse.json({ ok: false, status, message: "O acesso da clínica está temporariamente suspenso." }, { status: 403 });
    }
    if (status !== "APPROVED") {
      return NextResponse.json({ ok: false, message: "A clínica não está liberada para acesso." }, { status: 403 });
    }

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
    return NextResponse.json({ ok: false, message: error.message || "Erro ao entrar." }, { status: 500 });
  }
}
