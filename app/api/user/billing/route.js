import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d){10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;

  return digit === Number(cpf[10]);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, phone: true, cpf: true },
    });

    return NextResponse.json({
      ok: true,
      billing: {
        name: dbUser?.name || user.name || "",
        email: dbUser?.email || user.email || "",
        phone: dbUser?.phone || "",
        cpf: dbUser?.cpf || "",
        hasCpf: !!dbUser?.cpf,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message || "Erro ao buscar dados." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const cpf = onlyDigits(body.cpf || body.cpfCnpj || "");
    const phone = onlyDigits(body.phone || "");

    if (!isValidCpf(cpf)) {
      return NextResponse.json({ ok: false, message: "CPF inválido." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { cpf, ...(phone ? { phone } : {}) },
      select: { name: true, email: true, phone: true, cpf: true },
    });

    return NextResponse.json({ ok: true, billing: { ...updated, hasCpf: true } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message || "Erro ao salvar CPF." }, { status: 500 });
  }
}
