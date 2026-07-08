import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getPlanBySlug } from "../../../../lib/mercadopago";

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

    if (!body.token || !body.payment_method_id) {
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

    const mercadoPagoBody = {
      transaction_amount: Number(plan.price),
      token: body.token,
      description: `Eterniza - Plano ${plan.name}`,
      installments: Number(body.installments || 1),
      payment_method_id: body.payment_method_id,
      issuer_id: body.issuer_id ? String(body.issuer_id) : undefined,
      external_reference: tribute.id,
      payer: {
        email: payerFromBrick.email || user.email,
        identification: payerFromBrick.identification,
      },
    };

    Object.keys(mercadoPagoBody).forEach((key) => {
      if (mercadoPagoBody[key] === undefined || mercadoPagoBody[key] === null) {
        delete mercadoPagoBody[key];
      }
    });

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(mercadoPagoBody),
    });

    const mpPayment = await mpRes.json();

    if (!mpRes.ok) {
      console.error("Erro Mercado Pago cartão:", mpPayment);
      return NextResponse.json(
        {
          ok: false,
          message: mpPayment?.message || "Erro ao processar pagamento no cartão.",
          mercadoPago: mpPayment,
        },
        { status: mpRes.status }
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
