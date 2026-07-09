import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { ensureDefaultPlans, getPlans } from "../../../../lib/asaas";

function toCents(value) {
  if (value === undefined || value === null || value === "") return null;

  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) return null;

  return Math.round(number * 100);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 }) };
  }

  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ ok: false, message: "Acesso negado." }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await ensureDefaultPlans();
    const plans = await getPlans();

    return NextResponse.json({
      ok: true,
      plans,
    });
  } catch (error) {
    console.error("Erro em GET /api/admin/plans:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao buscar planos.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await ensureDefaultPlans();

    const body = await req.json().catch(() => ({}));
    const plans = Array.isArray(body.plans) ? body.plans : [];

    if (!plans.length) {
      return NextResponse.json(
        { ok: false, message: "Nenhum plano informado." },
        { status: 400 }
      );
    }

    for (const item of plans) {
      const slug = String(item.slug || "").trim();

      if (!slug) continue;

      const priceCents = toCents(item.price);
      const promoPriceCents = toCents(item.promoPrice);

      if (!priceCents || priceCents <= 0) {
        return NextResponse.json(
          { ok: false, message: `Valor inválido para o plano ${slug}.` },
          { status: 400 }
        );
      }

      const features = String(item.features || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      await prisma.planSetting.update({
        where: { slug },
        data: {
          name: String(item.name || slug),
          description: String(item.description || ""),
          priceCents,
          originalPriceCents: toCents(item.originalPrice),
          promoActive: Boolean(item.promoActive),
          promoName: String(item.promoName || ""),
          promoPriceCents,
          promoStartsAt: parseDate(item.promoStartsAt),
          promoEndsAt: parseDate(item.promoEndsAt),
          photos: Number(item.photos || 10),
          duration: String(item.duration || "vitalício"),
          features,
          sortOrder: Number(item.sortOrder || 0),
          isActive: item.isActive !== false,
        },
      });
    }

    const updated = await getPlans();

    return NextResponse.json({
      ok: true,
      message: "Planos atualizados com sucesso.",
      plans: updated,
    });
  } catch (error) {
    console.error("Erro em POST /api/admin/plans:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao salvar planos.",
      },
      { status: 500 }
    );
  }
}
