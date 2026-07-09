import { prisma } from "./prisma";

export const DEFAULT_PLANS = {
  essencial: {
    slug: "essencial",
    name: "Essencial",
    description: "Para uma homenagem simples e emocionante.",
    price: 19.9,
    priceCents: 1990,
    originalPriceCents: null,
    promoActive: false,
    promoName: "",
    promoPriceCents: null,
    photos: 2,
    duration: "1 mês",
    features: ["2 fotos", "Música por YouTube", "Carta personalizada"],
    sortOrder: 1,
    isActive: true,
  },
  premium: {
    slug: "premium",
    name: "Premium",
    description: "O mais escolhido. História completa com QR Code.",
    price: 39.9,
    priceCents: 3990,
    originalPriceCents: null,
    promoActive: false,
    promoName: "",
    promoPriceCents: null,
    photos: 10,
    duration: "vitalício",
    features: ["10 fotos", "Música de fundo", "Carta personalizada", "Contador para casais", "Data especial para casais"],
    sortOrder: 2,
    isActive: true,
  },
  eterno: {
    slug: "eterno",
    name: "Eterno",
    description: "Experiência completa para eternizar para sempre.",
    price: 69.9,
    priceCents: 6990,
    originalPriceCents: null,
    promoActive: false,
    promoName: "",
    promoPriceCents: null,
    photos: 20,
    duration: "vitalício",
    features: ["20 fotos", "Música de fundo", "Carta personalizada", "QR Code", "Página vitalícia"],
    sortOrder: 3,
    isActive: true,
  },
};

function centsToPrice(cents) {
  return Number(cents || 0) / 100;
}

function nowInsidePromo(plan) {
  if (!plan?.promoActive || !plan?.promoPriceCents) return false;

  const now = new Date();
  const starts = plan.promoStartsAt ? new Date(plan.promoStartsAt) : null;
  const ends = plan.promoEndsAt ? new Date(plan.promoEndsAt) : null;

  if (starts && now < starts) return false;
  if (ends && now > ends) return false;

  return true;
}

export function normalizePlan(plan) {
  const effectivePriceCents = nowInsidePromo(plan) ? plan.promoPriceCents : plan.priceCents;
  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === "string"
    ? plan.features.split("\\n").map((x) => x.trim()).filter(Boolean)
    : [];

  return {
    slug: plan.slug,
    id: plan.slug,
    name: plan.name,
    description: plan.description || "",
    desc: plan.description || "",
    price: centsToPrice(effectivePriceCents),
    priceCents: effectivePriceCents,
    cents: effectivePriceCents,
    regularPriceCents: plan.priceCents,
    originalPriceCents: plan.originalPriceCents,
    promoActive: nowInsidePromo(plan),
    promoName: nowInsidePromo(plan) ? plan.promoName || "Promoção" : "",
    promoPriceCents: plan.promoPriceCents,
    photos: Number(plan.photos || 10),
    duration: plan.duration || "vitalício",
    features,
    sortOrder: Number(plan.sortOrder || 0),
    isActive: plan.isActive !== false,
  };
}

export async function ensureDefaultPlans() {
  const defaults = Object.values(DEFAULT_PLANS);

  for (const plan of defaults) {
    await prisma.planSetting.upsert({
      where: { slug: plan.slug },
      update: {},
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        originalPriceCents: plan.originalPriceCents,
        promoActive: plan.promoActive,
        promoName: plan.promoName,
        promoPriceCents: plan.promoPriceCents,
        photos: plan.photos,
        duration: plan.duration,
        features: plan.features,
        sortOrder: plan.sortOrder,
        isActive: plan.isActive,
      },
    });
  }
}

export async function getPlans() {
  await ensureDefaultPlans();

  const plans = await prisma.planSetting.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
  });

  return plans.map(normalizePlan);
}

export async function getPlanBySlug(slug) {
  await ensureDefaultPlans();

  const plan =
    (await prisma.planSetting.findUnique({
      where: { slug: String(slug || "premium") },
    })) ||
    (await prisma.planSetting.findUnique({
      where: { slug: "premium" },
    }));

  return normalizePlan(plan || DEFAULT_PLANS.premium);
}

export function getAsaasBaseUrl() {
  const env = String(process.env.ASAAS_ENV || "production").toLowerCase();
  return env === "sandbox" || env === "test"
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";
}

export function getAsaasApiKey() {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada no ambiente.");
  }
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

  return {
    payment,
    customer,
    qrCode,
  };
}

export async function getAsaasPayment(paymentId) {
  return asaasFetch(`/payments/${paymentId}`, {
    method: "GET",
  });
}
