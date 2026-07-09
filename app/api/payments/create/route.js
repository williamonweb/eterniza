import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createAsaasPixPayment, getPlanBySlug } from "../../../../lib/asaas";

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tributeId = String(body.tributeId || "");
    const planSlug = String(body.plan || "premium");

    if (!tributeId) {
      return NextResponse.json({ ok: false, message: "Homenagem não informada." }, { status: 400 });
    }

    const tribute = await prisma.tribute.findFirst({
      where: { id: tributeId, userId: user.id },
    });

    if (!tribute) {
      return NextResponse.json({ ok: false, message: "Homenagem não encontrada." }, { status: 404 });
    }

    const plan = await getPlanBySlug(planSlug);

    const asaasResult = await createAsaasPixPayment({
      tributeId: tribute.id,
      payerEmail: user.email,
      payerName: user.name,
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
