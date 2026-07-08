import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getPlanBySlug } from "../../../../lib/mercadopago";

function cleanObject(obj) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === undefined || value === null || value === "") {
      delete obj[key];
    } else if (typeof value === "object" && !Array.isArray(value)) {
      cleanObject(value);
      if (Object.keys(value).length === 0) delete obj[key];
    }
  });
  return obj;
}

function getPaymentErrorMessage(error) {
  const apiMessage =
    error?.message ||
    error?.cause?.[0]?.description ||
    error?.error ||
    error?.response?.message;

  return apiMessage || "Erro ao processar pagamento no cartão.";
}

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

    const token = body.token || body.cardToken;
    const paymentMethodId =
      body.payment_method_id ||
      body.paymentMethodId ||
      body.payment_method?.id ||
      body.paymentMethod?.id;

    if (!token || !paymentMethodId) {
      return NextResponse.json(
        { ok: false, message: "Dados do cartão incompletos." },
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

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: "MP_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const plan = getPlanBySlug(planSlug);
    const payerFromBrick = body.payer || {};

    const mercadoPagoBody = cleanObject({
      transaction_amount: Number(plan.price),
      token,
      description: `Eterniza - Plano ${plan.name}`,
      installments: Number(body.installments || 1),
      payment_method_id: paymentMethodId,
      issuer_id: body.issuer_id ? String(body.issuer_id) : undefined,
      external_reference: tribute.id,
      capture: true,
      binary_mode: false,
      payer: {
        email: payerFromBrick.email || user.email,
        identification: payerFromBrick.identification,
      },
    });

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      },
    });

    const paymentClient = new Payment(client);

    let mpPayment;

    try {
      mpPayment = await paymentClient.create({
        body: mercadoPagoBody,
        requestOptions: {
          idempotencyKey: crypto.randomUUID(),
        },
      });
    } catch (mpError) {
      console.error("Erro Mercado Pago SDK cartão:", JSON.stringify(mpError, null, 2));
      return NextResponse.json(
        {
          ok: false,
          message: getPaymentErrorMessage(mpError),
          mercadoPago: mpError,
        },
        { status: mpError?.status || 400 }
      );
    }

    const paymentStatus = String(mpPayment.status || "pending").toUpperCase();

    await prisma.payment.create({
      data: {
        tributeId: tribute.id,
        amount: plan.price,
        status: paymentStatus,
        mercadoPagoId: String(mpPayment.id),
      },
    });

    if (String(mpPayment.status).toLowerCase() === "approved") {
      await prisma.tribute.update({
        where: { id: tribute.id },
        data: {
          status: "PUBLISHED",
          planId: plan.slug,
          planName: plan.name,
          planPriceCents: plan.priceCents,
          publishedAt: new Date(),
          publicUrl: tribute.publicUrl || `/presente/${tribute.slug}`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      payment: {
        id: mpPayment.id,
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail,
        plan,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/card:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao processar cartão." },
      { status: 500 }
    );
  }
}
