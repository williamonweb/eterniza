export const PLANS = {
  essencial: {
    slug: "essencial",
    name: "Essencial",
    price: 19.9,
    priceCents: 1990,
  },
  premium: {
    slug: "premium",
    name: "Premium",
    price: 39.9,
    priceCents: 3990,
  },
  eterno: {
    slug: "eterno",
    name: "Eterno",
    price: 69.9,
    priceCents: 6990,
  },
};

export function getPlanBySlug(slug) {
  return PLANS[slug] || PLANS.premium;
}

export async function createPixPayment({
  tributeId,
  payerEmail,
  payerName,
  plan,
}) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN não configurado no .env");
  }

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: Number(plan.price),
      description: `Eterniza - Plano ${plan.name}`,
      payment_method_id: "pix",
      external_reference: tributeId,
      payer: {
        email: payerEmail,
        first_name: payerName || "Cliente",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro Mercado Pago:", data);
    throw new Error(data?.message || "Erro ao criar pagamento Pix.");
  }

  return data;
}