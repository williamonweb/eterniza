import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getPlanBySlug } from "../../../../lib/mercadopago";

function getBaseUrl(req) {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

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

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: "MP_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const plan = getPlanBySlug(planSlug);
    const baseUrl = getBaseUrl(req);
    const isTestMode = String(accessToken).startsWith("TEST-");

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      },
    });

    const preferenceClient = new Preference(client);

    const preferenceBody = cleanObject({
      external_reference: tribute.id,
      statement_descriptor: "ETERNIZA",
      notification_url: `${baseUrl}/api/payments/webhook`,
      back_urls: {
        success: `${baseUrl}/dashboard?payment=success&tribute=${encodeURIComponent(tribute.id)}`,
        pending: `${baseUrl}/dashboard?payment=pending&tribute=${encodeURIComponent(tribute.id)}`,
        failure: `${baseUrl}/dashboard?payment=failure&tribute=${encodeURIComponent(tribute.id)}`,
      },
      auto_return: "approved",
      items: [
        {
          id: plan.slug,
          title: `Eterniza - Plano ${plan.name}`,
          description: `Publicação da homenagem Eterniza - Plano ${plan.name}`,
          quantity: 1,
          unit_price: Number(plan.price),
          currency_id: "BRL",
        },
      ],
      payer: {
        email: user.email,
        name: user.name || "Cliente Eterniza",
      },
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" },
          { id: "atm" },
          { id: "bank_transfer" },
        ],
        installments: 1,
      },
      metadata: {
        tribute_id: tribute.id,
        user_id: user.id,
        plan: plan.slug,
      },
    });

    let preference;

    try {
      preference = await preferenceClient.create({
        body: preferenceBody,
        requestOptions: {
          idempotencyKey: crypto.randomUUID(),
        },
      });
    } catch (mpError) {
      console.error("Erro Mercado Pago Checkout Pro:", JSON.stringify(mpError, null, 2));
      return NextResponse.json(
        {
          ok: false,
          message:
            mpError?.message ||
            mpError?.cause?.[0]?.description ||
            "Erro ao criar checkout Mercado Pago.",
          mercadoPago: mpError,
        },
        { status: mpError?.status || 400 }
      );
    }

    const checkoutUrl = isTestMode
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point || preference.sandbox_init_point;

    if (!checkoutUrl) {
      return NextResponse.json(
        { ok: false, message: "Mercado Pago não retornou o link do checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      preferenceId: preference.id,
      mode: isTestMode ? "test" : "production",
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/card:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao iniciar checkout com cartão." },
      { status: 500 }
    );
  }
}
