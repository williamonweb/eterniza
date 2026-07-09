export const DEFAULT_PLANS = {
  essencial: {
    slug: "essencial",
    id: "essencial",
    name: "Essencial",
    description: "Para uma homenagem simples e emocionante.",
    desc: "Para uma homenagem simples e emocionante.",
    price: 19.9,
    priceCents: 1990,
    cents: 1990,
    photos: 2,
    duration: "1 mês",
    features: ["2 fotos", "Música por YouTube", "Carta personalizada"],
  },
  premium: {
    slug: "premium",
    id: "premium",
    name: "Premium",
    description: "O mais escolhido. História completa com QR Code.",
    desc: "O mais escolhido. História completa com QR Code.",
    price: 39.9,
    priceCents: 3990,
    cents: 3990,
    photos: 10,
    duration: "vitalício",
    features: ["10 fotos", "Música de fundo", "Carta personalizada", "Contador para casais", "Data especial para casais"],
  },
  eterno: {
    slug: "eterno",
    id: "eterno",
    name: "Eterno",
    description: "Experiência completa para eternizar para sempre.",
    desc: "Experiência completa para eternizar para sempre.",
    price: 69.9,
    priceCents: 6990,
    cents: 6990,
    photos: 20,
    duration: "vitalício",
    features: ["20 fotos", "Música de fundo", "Carta personalizada", "QR Code", "Página vitalícia"],
  },
};

export const PLANS = DEFAULT_PLANS;

export function normalizePlan(plan) {
  return {
    ...plan,
    id: plan.slug || plan.id,
    slug: plan.slug || plan.id,
    price: Number(plan.priceCents || plan.cents || 0) / 100,
    priceCents: Number(plan.priceCents || plan.cents || 0),
    cents: Number(plan.priceCents || plan.cents || 0),
    description: plan.description || plan.desc || "",
    desc: plan.description || plan.desc || "",
    promoActive: false,
  };
}

export async function ensureDefaultPlans() {
  return true;
}

export async function getPlans() {
  return Object.values(DEFAULT_PLANS).map(normalizePlan);
}

export async function getPlanBySlug(slug) {
  return normalizePlan(DEFAULT_PLANS[String(slug || "premium")] || DEFAULT_PLANS.premium);
}

export function getAsaasBaseUrl() {
  const env = String(process.env.ASAAS_ENV || "production").toLowerCase();
  return env === "sandbox" || env === "test"
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";
}

export function getAsaasApiKey() {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error("ASAAS_API_KEY não configurada no ambiente.");
  return apiKey;
}

async function asaasFetch(path, options = {}) {
  const response = await fetch(`${getAsaasBaseUrl()}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      access_token: getAsaasApiKey(),
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Erro Asaas:", data);
    const message =
      data?.errors?.[0]?.description ||
      data?.message ||
      data?.error ||
      "Erro ao comunicar com o Asaas.";
    throw new Error(message);
  }

  return data;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function createAsaasCustomer({ name, email, cpfCnpj }) {
  return asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: name || email || "Cliente Eterniza",
      email: email || undefined,
      cpfCnpj:
        cpfCnpj ||
        (String(process.env.ASAAS_ENV).toLowerCase() === "sandbox"
          ? "12345678909"
          : undefined),
    }),
  });
}

export async function createAsaasPixPayment({ tributeId, payerEmail, payerName, plan }) {
  const customer = await createAsaasCustomer({
    name: payerName || "Cliente Eterniza",
    email: payerEmail,
    cpfCnpj:
      String(process.env.ASAAS_ENV).toLowerCase() === "sandbox"
        ? "12345678909"
        : undefined,
  });

  const payment = await asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customer.id,
      billingType: "PIX",
      value: Number(plan.price),
      dueDate: todayIsoDate(),
      description: `Eterniza - Plano ${plan.name}`,
      externalReference: tributeId,
    }),
  });

  const qrCode = await asaasFetch(`/payments/${payment.id}/pixQrCode`, {
    method: "GET",
  });

  return { payment, customer, qrCode };
}

export async function getAsaasPayment(paymentId) {
  return asaasFetch(`/payments/${paymentId}`, { method: "GET" });
}
