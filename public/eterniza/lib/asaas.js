import { prisma } from "./prisma";

export const DEFAULT_PLANS = {
  essencial: {
    slug: "essencial",
    id: "essencial",
    name: "Essencial",
    description: "Para uma homenagem simples e emocionante.",
    desc: "Para uma homenagem simples e emocionante.",
    priceCents: 1990,
    originalPriceCents: 1990,
    photos: 2,
    duration: "1 mês",
    features: ["2 fotos", "Música por YouTube", "Carta personalizada"],
    sortOrder: 1,
    isActive: true,
  },
  premium: {
    slug: "premium",
    id: "premium",
    name: "Premium",
    description: "O mais escolhido. História completa com QR Code.",
    desc: "O mais escolhido. História completa com QR Code.",
    priceCents: 3990,
    originalPriceCents: 3990,
    photos: 10,
    duration: "vitalício",
    features: [
      "10 fotos",
      "Música de fundo",
      "Carta personalizada",
      "Contador para casais",
      "Data especial para casais",
    ],
    sortOrder: 2,
    isActive: true,
  },
  eterno: {
    slug: "eterno",
    id: "eterno",
    name: "Eterno",
    description: "Experiência completa para eternizar para sempre.",
    desc: "Experiência completa para eternizar para sempre.",
    priceCents: 6990,
    originalPriceCents: 6990,
    photos: 20,
    duration: "vitalício",
    features: [
      "20 fotos",
      "Música de fundo",
      "Carta personalizada",
      "QR Code",
      "Página vitalícia",
    ],
    sortOrder: 3,
    isActive: true,
  },
};

export const PLANS = DEFAULT_PLANS;

function validDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function isPromotionActive(plan, now = new Date()) {
  if (!plan?.promoActive || !plan?.promoPriceCents) return false;

  const startsAt = plan.promoStartsAt ? new Date(plan.promoStartsAt) : null;
  const endsAt = plan.promoEndsAt ? new Date(plan.promoEndsAt) : null;

  if (startsAt && validDate(startsAt) && now < startsAt) return false;
  if (endsAt && validDate(endsAt)) {
    const inclusiveEnd = new Date(endsAt);
    inclusiveEnd.setHours(23, 59, 59, 999);
    if (now > inclusiveEnd) return false;
  }

  return true;
}

export function normalizePlan(plan) {
  const promoActive = isPromotionActive(plan);
  const regularPriceCents = Number(
    plan.originalPriceCents || plan.priceCents || plan.cents || 0
  );
  const activePriceCents = promoActive
    ? Number(plan.promoPriceCents)
    : Number(plan.priceCents || plan.cents || 0);

  return {
    ...plan,
    id: plan.slug || plan.id,
    slug: plan.slug || plan.id,
    price: activePriceCents / 100,
    priceCents: activePriceCents,
    cents: activePriceCents,
    regularPriceCents,
    originalPriceCents: regularPriceCents,
    description: plan.description || plan.desc || "",
    desc: plan.description || plan.desc || "",
    features: Array.isArray(plan.features) ? plan.features : [],
    promoActive,
    configuredPromoActive: Boolean(plan.promoActive),
    promoStartsAt: plan.promoStartsAt || null,
    promoEndsAt: plan.promoEndsAt || null,
    isActive: plan.isActive !== false,
  };
}

export async function ensureDefaultPlans() {
  await Promise.all(
    Object.values(DEFAULT_PLANS).map((plan) =>
      prisma.planSetting.upsert({
        where: { slug: plan.slug },
        update: {},
        create: {
          slug: plan.slug,
          name: plan.name,
          description: plan.description,
          priceCents: plan.priceCents,
          originalPriceCents: plan.originalPriceCents,
          promoActive: false,
          promoName: "",
          promoPriceCents: null,
          promoStartsAt: null,
          promoEndsAt: null,
          photos: plan.photos,
          duration: plan.duration,
          features: plan.features,
          sortOrder: plan.sortOrder,
          isActive: true,
        },
      })
    )
  );
}

export async function getPlans({ includeInactive = false } = {}) {
  await ensureDefaultPlans();

  const plans = await prisma.planSetting.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return plans.map(normalizePlan);
}

export async function getPlanBySlug(slug) {
  await ensureDefaultPlans();

  const normalizedSlug = String(slug || "").trim().toLowerCase();
  const plan = await prisma.planSetting.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!plan || !plan.isActive) {
    throw new Error("O plano selecionado não está disponível.");
  }

  return normalizePlan(plan);
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

export async function createAsaasPixPayment({
  tributeId,
  payerEmail,
  payerName,
  payerCpfCnpj,
  plan,
}) {
  const customer = await createAsaasCustomer({
    name: payerName || "Cliente Eterniza",
    email: payerEmail,
    cpfCnpj: payerCpfCnpj,
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
