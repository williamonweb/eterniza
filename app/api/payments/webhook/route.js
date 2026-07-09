import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getAsaasPayment } from "../../../../lib/asaas";

function normalizeAsaasStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(normalized)) return "APPROVED";
  if (["REFUNDED"].includes(normalized)) return "REFUNDED";
  if (["OVERDUE", "DELETED", "CANCELLED"].includes(normalized)) return "CANCELLED";
  return "PENDING";
}

function isPaidAsaasEvent(event, status) {
  const ev = String(event || "").toUpperCase();
  const st = String(status || "").toUpperCase();

  return (
    ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED_IN_CASH"].includes(ev) ||
    ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(st)
  );
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = body?.event || "";
    let asaasPayment = body?.payment || null;

    if (!asaasPayment?.id) {
      return NextResponse.json({ ok: false, message: "ID da cobrança Asaas não encontrado." }, { status: 400 });
    }

    try {
      asaasPayment = await getAsaasPayment(asaasPayment.id);
    } catch (error) {
      console.warn("Não foi possível consultar cobrança completa no Asaas. Usando payload do webhook.", error);
    }

    const asaasId = String(asaasPayment.id);
    const tributeId = String(asaasPayment.externalReference || "");
    const status = String(asaasPayment.status || "").toUpperCase();
    const paymentStatus = normalizeAsaasStatus(status);

    const existingPayment = await prisma.payment.findFirst({
      where: { mercadoPagoId: asaasId },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: paymentStatus },
      });
    } else if (tributeId) {
      await prisma.payment.create({
        data: {
          tributeId,
          mercadoPagoId: asaasId,
          status: paymentStatus,
          amount: Number(asaasPayment.value || 0),
        },
      });
    }

    if (tributeId && isPaidAsaasEvent(event, status)) {
      await prisma.tribute.update({
        where: { id: tributeId },
        data: { status: "PUBLISHED" },
      });
    }

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      event,
      asaasId,
      tributeId,
      asaasStatus: status,
      paymentStatus,
      published: tributeId ? isPaidAsaasEvent(event, status) : false,
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/webhook (Asaas):", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro no webhook Asaas." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "asaas",
    message: "Webhook Asaas ativo.",
  });
}
