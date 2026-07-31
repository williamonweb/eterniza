import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import { hasAdminPermission } from "../../../../../lib/adminPermissions";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 }) };
  if (!hasAdminPermission(user, "marketing")) return { error: NextResponse.json({ ok: false, message: "Acesso negado." }, { status: 403 }) };
  return { user };
}

function slugify(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function nullableDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function payload(body) {
  const name = String(body.name || "").trim();
  const titleBefore = String(body.titleBefore || "").trim();
  const heroImageUrl = String(body.heroImageUrl || "").trim();
  if (!name || !titleBefore) throw new Error("Informe o nome e o título principal da campanha.");
  if (heroImageUrl.length > 2_000_000) throw new Error("A imagem promocional ficou muito grande. Escolha outra imagem.");
  if (heroImageUrl.startsWith("data:") && !heroImageUrl.startsWith("data:image/")) throw new Error("O arquivo enviado não é uma imagem válida.");
  return {
    name,
    slug: slugify(body.slug || name),
    type: String(body.type || "CUSTOM").toUpperCase(),
    isActive: Boolean(body.isActive),
    startDate: nullableDate(body.startDate),
    endDate: nullableDate(body.endDate),
    priority: Math.max(0, Number.parseInt(body.priority || 0, 10) || 0),
    badge: String(body.badge || "").trim() || null,
    titleBefore,
    titleHighlight: String(body.titleHighlight || "").trim() || null,
    subtitle: String(body.subtitle || "").trim() || null,
    buttonText: String(body.buttonText || "Criar minha homenagem").trim(),
    buttonLink: String(body.buttonLink || "/cadastro").trim(),
    heroImageUrl: heroImageUrl || null,
    showTopBanner: Boolean(body.showTopBanner),
    bannerText: String(body.bannerText || "").trim() || null,
    bannerButtonText: String(body.bannerButtonText || "").trim() || null,
    bannerButtonLink: String(body.bannerButtonLink || "").trim() || null,
    primaryColor: String(body.primaryColor || "#efbd52").trim(),
    backgroundColor: String(body.backgroundColor || "").trim() || null,
  };
}

export async function GET() {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const campaigns = await prisma.campaign.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json({ ok: true, campaigns });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message || "Erro ao buscar campanhas." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const body = await req.json().catch(() => ({}));
    const data = payload(body);
    const campaign = body.id
      ? await prisma.campaign.update({ where: { id: body.id }, data })
      : await prisma.campaign.create({ data });
    return NextResponse.json({ ok: true, campaign, message: "Campanha salva com sucesso." });
  } catch (error) {
    const status = error?.code === "P2002" ? 409 : 400;
    return NextResponse.json({ ok: false, message: error?.code === "P2002" ? "Já existe uma campanha com esse slug." : (error.message || "Erro ao salvar campanha.") }, { status });
  }
}

export async function DELETE(req) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const body = await req.json().catch(() => ({}));
    if (!body.id) return NextResponse.json({ ok: false, message: "Campanha inválida." }, { status: 400 });
    await prisma.campaign.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true, message: "Campanha excluída." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message || "Erro ao excluir campanha." }, { status: 500 });
  }
}
