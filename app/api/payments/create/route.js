import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createPixPayment, getPlanBySlug } from "../../../../lib/mercadopago";

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

    const mpPayment = await createPixPayment({
      tributeId: tribute.id,
      payerEmail: user.email,
      payerName: user.name,
      plan,
    });

    const qrData = mpPayment?.point_of_interaction?.transaction_data;

    const payment = await prisma.payment.create({
      data: {
        tributeId: tribute.id,
        amount: plan.price,
        status: "PENDING",
        mercadoPagoId: String(mpPayment.id),
      },
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: payment.id,
        mercadoPagoId: mpPayment.id,
        status: mpPayment.status,
        plan,
        qrCode: qrData?.qr_code || null,
        qrCodeBase64: qrData?.qr_code_base64 || null,
        ticketUrl: qrData?.ticket_url || null,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/create:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao criar pagamento.",
      },
      { status: 500 }
    );
  }
}