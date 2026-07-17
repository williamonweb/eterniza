import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/pets/team-permissions";

export const dynamic = "force-dynamic";

function clean(value, max = 255) {
  return String(value ?? "").trim().slice(0, max);
}

function optional(value, max = 255) {
  const result = clean(value, max);
  return result || null;
}

function validColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

async function getContext() {
  const current = await getCurrentUser();
  if (!current?.id || current.isActive === false || !current.clinicId) return null;

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: {
      id: true,
      role: true,
      clinicId: true,
      isActive: true,
      permissions: true,
      clinic: true,
    },
  });

  if (!user || user.isActive === false || user.clinic?.status !== "APPROVED") return null;
  return user;
}

function payload(user) {
  const clinic = user.clinic;
  return {
    id: clinic.id,
    code: clinic.code,
    legalName: clinic.legalName,
    tradeName: clinic.tradeName,
    cnpj: clinic.cnpj,
    stateRegistration: clinic.stateRegistration || "",
    email: clinic.email,
    phone: clinic.phone,
    whatsapp: clinic.whatsapp || "",
    website: clinic.website || "",
    instagram: clinic.instagram || "",
    zipCode: clinic.zipCode || "",
    street: clinic.street || "",
    number: clinic.number || "",
    complement: clinic.complement || "",
    district: clinic.district || "",
    city: clinic.city || "",
    state: clinic.state || "",
    responsibleName: clinic.responsibleName,
    responsibleRole: clinic.responsibleRole || "",
    responsiblePhone: clinic.responsiblePhone,
    responsibleEmail: clinic.responsibleEmail,
    logoUrl: clinic.logoUrl || "",
    primaryColor: clinic.primaryColor || "#277ed4",
    signature: clinic.signature || "",
    showEternizaBrand: clinic.showEternizaBrand !== false,
    showEternizaCta: clinic.showEternizaCta !== false,
    eternizaCtaText: clinic.eternizaCtaText || "Conheça o Eterniza",
    eternizaCtaUrl: clinic.eternizaCtaUrl || "https://eternizas.com.br",
    monthlyPackageName: clinic.monthlyPackageName,
    monthlyPriceCents: clinic.monthlyPriceCents,
    monthlyTributeLimit: clinic.monthlyTributeLimit,
    billingDay: clinic.billingDay,
    status: clinic.status,
    canManage: hasPermission(user, "settings.manage"),
  };
}

export async function GET() {
  try {
    const user = await getContext();
    if (!user) return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
    if (!hasPermission(user, "settings.view")) {
      return NextResponse.json({ ok: false, message: "Você não possui permissão para visualizar as configurações." }, { status: 403 });
    }
    return NextResponse.json({ ok: true, settings: payload(user) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[pets/settings:get]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível carregar as configurações." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getContext();
    if (!user) return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
    if (!hasPermission(user, "settings.manage")) {
      return NextResponse.json({ ok: false, message: "Você não possui permissão para alterar as configurações." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const tradeName = clean(body.tradeName, 150);
    const legalName = clean(body.legalName, 180);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 30);
    const responsibleName = clean(body.responsibleName, 150);
    const responsiblePhone = clean(body.responsiblePhone, 30);
    const responsibleEmail = clean(body.responsibleEmail, 180).toLowerCase();

    if (!tradeName || !legalName || !email || !phone || !responsibleName || !responsiblePhone || !responsibleEmail) {
      return NextResponse.json({ ok: false, message: "Preencha os campos obrigatórios da clínica e do responsável." }, { status: 400 });
    }

    const primaryColor = validColor(body.primaryColor) ? body.primaryColor : "#277ed4";

    await prisma.clinic.update({
      where: { id: user.clinicId },
      data: {
        tradeName,
        legalName,
        stateRegistration: optional(body.stateRegistration, 40),
        email,
        phone,
        whatsapp: optional(body.whatsapp, 30),
        website: optional(body.website, 240),
        instagram: optional(body.instagram, 120),
        zipCode: optional(body.zipCode, 20),
        street: optional(body.street, 180),
        number: optional(body.number, 30),
        complement: optional(body.complement, 100),
        district: optional(body.district, 100),
        city: optional(body.city, 100),
        state: optional(body.state, 2)?.toUpperCase() || null,
        responsibleName,
        responsibleRole: optional(body.responsibleRole, 100),
        responsiblePhone,
        responsibleEmail,
        logoUrl: optional(body.logoUrl, 1000),
        primaryColor,
        signature: optional(body.signature, 300),
        showEternizaBrand: body.showEternizaBrand !== false,
        showEternizaCta: body.showEternizaCta !== false,
        eternizaCtaText: clean(body.eternizaCtaText, 100) || "Conheça o Eterniza",
        eternizaCtaUrl: clean(body.eternizaCtaUrl, 1000) || "https://eternizas.com.br",
      },
    });

    const refreshed = await getContext();
    return NextResponse.json({ ok: true, settings: payload(refreshed) });
  } catch (error) {
    console.error("[pets/settings:patch]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível salvar as configurações." }, { status: 500 });
  }
}
