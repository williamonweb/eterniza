import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createAsaasPixPayment, getPlanBySlug } from "../../../../lib/asaas";

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const tributeId = String(body.tributeId || "");
    const planSlug = String(body.plan || "premium");

    if (!tributeId) {
      return NextResponse.json(
        { ok: false, message: "Homenagem não informada." },
        { status: 400 }
      );
    }

    const tribute = await prisma.tribute.findFirst({
      where: {
        id: tributeId,
        userId: user.id,
      },
    });

    if (!tribute) {
      return NextResponse.json(
        { ok: false, message: "Homenagem não encontrada." },
        { status: 404 }
      );
    }

    const plan = getPlanBySlug(planSlug);
    const asaasResult = await createAsaasPixPayment({
      tributeId: tribute.id,
      payerEmail: user.email,
      payerName: user.name,
      plan,
    });

    const asaasPayment = asaasResult.payment;
    const pixQrCode = asaasResult.qrCode;

    const payment = await prisma.payment.create({
      data: {
        tributeId: tribute.id,
        amount: plan.price,
        status: "PENDING",
        mercadoPagoId: String(asaasPayment.id),
      },
    });

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      payment: {
        id: payment.id,
        asaasId: asaasPayment.id,
        mercadoPagoId: asaasPayment.id,
        status: asaasPayment.status,
        plan,
        qrCode: pixQrCode?.payload || null,
        qrCodeBase64: pixQrCode?.encodedImage || null,
        expirationDate: pixQrCode?.expirationDate || null,
        ticketUrl: asaasPayment.invoiceUrl || asaasPayment.bankSlipUrl || null,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/create (Asaas):", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao criar pagamento PIX no Asaas.",
      },
      { status: 500 }
    );
  }
}
