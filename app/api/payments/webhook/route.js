import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

async function getMercadoPagoPayment(paymentId) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN não configurado no .env");
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao consultar pagamento Mercado Pago:", data);
    throw new Error(data?.message || "Erro ao consultar pagamento.");
  }

  return data;
}

function extractPaymentId(body, url) {
  return (
    body?.data?.id ||
    body?.id ||
    body?.resource?.split?.("/")?.pop() ||
    url.searchParams.get("id") ||
    url.searchParams.get("data.id")
  );
}

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const type = body?.type || body?.topic || url.searchParams.get("type");
    const paymentId = extractPaymentId(body, url);

    if (type && !String(type).includes("payment")) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        message: "Notificação ignorada.",
      });
    }

    if (!paymentId) {
      return NextResponse.json(
        { ok: false, message: "ID do pagamento não encontrado." },
        { status: 400 }
      );
    }

    const mpPayment = await getMercadoPagoPayment(paymentId);

    const mercadoPagoId = String(mpPayment.id);
    const tributeId = String(mpPayment.external_reference || "");
    const status = String(mpPayment.status || "").toLowerCase();

    const paymentStatus =
      status === "approved"
        ? "APPROVED"
        : status === "rejected"
        ? "REJECTED"
        : status === "cancelled"
        ? "CANCELLED"
        : status === "refunded"
        ? "REFUNDED"
        : "PENDING";

    const existingPayment = await prisma.payment.findFirst({
      where: {
        mercadoPagoId,
      },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: paymentStatus,
        },
      });
    } else if (tributeId) {
      await prisma.payment.create({
        data: {
          tributeId,
          mercadoPagoId,
          status: paymentStatus,
          amount: Number(mpPayment.transaction_amount || 0),
        },
      });
    }

    if (status === "approved" && tributeId) {
      await prisma.tribute.update({
        where: {
          id: tributeId,
        },
        data: {
          status: "PUBLISHED",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      mercadoPagoId,
      tributeId,
      mercadoPagoStatus: status,
      paymentStatus,
      published: status === "approved",
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/webhook:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro no webhook.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook Mercado Pago ativo.",
  });
}