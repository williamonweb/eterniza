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
    return {
      error: NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      ),
    };
  }

  if (String(user.role).toUpperCase() !== "ADMIN") {
    return {
      error: NextResponse.json(
        { ok: false, message: "Acesso negado." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const plans = await getPlans({ includeInactive: true });
    return NextResponse.json({ ok: true, plans });
  } catch (error) {
    console.error("Erro em GET /api/admin/plans:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao buscar planos." },
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
      const slug = String(item.slug || "").trim().toLowerCase();
      if (!slug) continue;

      const priceCents = toCents(item.price);
      const promoPriceCents = toCents(item.promoPrice);
      const originalPriceCents = toCents(item.originalPrice) || priceCents;

      if (!priceCents || priceCents <= 0) {
        return NextResponse.json(
          { ok: false, message: `Valor inválido para o plano ${slug}.` },
          { status: 400 }
        );
      }

      if (item.promoActive && (!promoPriceCents || promoPriceCents <= 0)) {
        return NextResponse.json(
          { ok: false, message: `Informe o valor promocional do plano ${slug}.` },
          { status: 400 }
        );
      }

      const features = Array.isArray(item.features)
        ? item.features.map(String).map((x) => x.trim()).filter(Boolean)
        : String(item.features || "")
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);

      await prisma.planSetting.upsert({
        where: { slug },
        create: {
          slug,
          name: String(item.name || slug),
          description: String(item.description || ""),
          priceCents,
          originalPriceCents,
          promoActive: Boolean(item.promoActive),
          promoName: String(item.promoName || ""),
          promoPriceCents,
          promoStartsAt: parseDate(item.promoStartsAt),
          promoEndsAt: parseDate(item.promoEndsAt),
          photos: Math.max(1, Number(item.photos || 1)),
          duration: String(item.duration || "vitalício"),
          features,
          sortOrder: Number(item.sortOrder || 0),
          isActive: item.isActive !== false,
        },
        update: {
          name: String(item.name || slug),
          description: String(item.description || ""),
          priceCents,
          originalPriceCents,
          promoActive: Boolean(item.promoActive),
          promoName: String(item.promoName || ""),
          promoPriceCents,
          promoStartsAt: parseDate(item.promoStartsAt),
          promoEndsAt: parseDate(item.promoEndsAt),
          photos: Math.max(1, Number(item.photos || 1)),
          duration: String(item.duration || "vitalício"),
          features,
          sortOrder: Number(item.sortOrder || 0),
          isActive: item.isActive !== false,
        },
      });
    }

    const updated = await getPlans({ includeInactive: true });

    return NextResponse.json({
      ok: true,
      message: "Planos atualizados com sucesso.",
      plans: updated,
    });
  } catch (error) {
    console.error("Erro em POST /api/admin/plans:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao salvar planos." },
      { status: 500 }
    );
  }
}
