import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createAsaasPixPayment, getPlanBySlug } from "../../../../lib/asaas";

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

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tributeId = String(body.tributeId || "");
    const planSlug = String(body.plan || "premium");
    const cpfFromBody = onlyDigits(body.cpfCnpj || body.cpf || "");

    if (!tributeId) {
      return NextResponse.json({ ok: false, message: "Homenagem não informada." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, cpf: true },
    });

    if (!dbUser) {
      return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });
    }

    const cpfCnpj = cpfFromBody || onlyDigits(dbUser.cpf || "");

    if (!isValidCpf(cpfCnpj)) {
      return NextResponse.json(
        {
          ok: false,
          code: "CPF_REQUIRED",
          message: "Informe um CPF válido para gerar o PIX.",
        },
        { status: 400 }
      );
    }

    const tribute = await prisma.tribute.findFirst({
      where: { id: tributeId, userId: user.id },
    });

    if (!tribute) {
      return NextResponse.json({ ok: false, message: "Homenagem não encontrada." }, { status: 404 });
    }

    if (cpfCnpj && cpfCnpj !== onlyDigits(dbUser.cpf || "")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { cpf: cpfCnpj },
      });
    }

    const plan = await getPlanBySlug(planSlug);

    const asaasResult = await createAsaasPixPayment({
      tributeId: tribute.id,
      payerEmail: dbUser.email,
      payerName: dbUser.name,
      payerCpfCnpj: cpfCnpj,
      plan,
    });

    const payment = await prisma.payment.create({
      data: {
        tributeId: tribute.id,
        amount: plan.price,
        status: "PENDING",
        mercadoPagoId: String(asaasResult.payment.id),
      },
    });

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      payment: {
        id: payment.id,
        mercadoPagoId: asaasResult.payment.id,
        asaasId: asaasResult.payment.id,
        status: asaasResult.payment.status,
        plan,
        qrCode:
          asaasResult.qrCode?.payload ||
          asaasResult.qrCode?.pixCopiaECola ||
          null,
        qrCodeBase64:
          asaasResult.qrCode?.encodedImage ||
          asaasResult.qrCode?.qrCodeBase64 ||
          null,
        ticketUrl:
          asaasResult.payment?.invoiceUrl ||
          asaasResult.payment?.bankSlipUrl ||
          null,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/create:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao criar pagamento." },
      { status: 500 }
    );
  }
}
