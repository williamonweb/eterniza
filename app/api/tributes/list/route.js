import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

function normalizeContent(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolvePlan(tribute) {
  const content = normalizeContent(tribute.content);
  const contentPlan = normalizeContent(content.plan);

  const planId =
    tribute.planId ||
    contentPlan.slug ||
    contentPlan.id ||
    null;

  const planName =
    tribute.planName ||
    contentPlan.name ||
    null;

  const planPriceCents = Number(
    tribute.planPriceCents ||
    contentPlan.priceCents ||
    contentPlan.cents ||
    0
  );

  const planPhotos = Number(
    contentPlan.photos ||
    contentPlan.maxPhotos ||
    0
  );

  const planDuration =
    contentPlan.duration ||
    null;

  return {
    id: planId,
    slug: planId,
    name: planName,
    priceCents: planPriceCents,
    photos: planPhotos,
    duration: planDuration,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado.", tributes: [] },
        { status: 401 }
      );
    }

    const where = user.role === "ADMIN" ? {} : { userId: user.id };

    const tributes = await prisma.tribute.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        photos: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            url: true,
            caption: true,
            order: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            mercadoPagoId: true,
            createdAt: true,
          },
        },
        views: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      tributes: tributes.map((tribute) => {
        const content = normalizeContent(tribute.content);
        const plan = resolvePlan(tribute);

        return {
          id: tribute.id,
          title: tribute.title,
          category: tribute.category,
          message: tribute.message,
          music: tribute.music,
          content,
          status: tribute.status,
          slug: tribute.slug,

          receiver_name:
            tribute.receiverName ||
            content.receiverName ||
            tribute.title ||
            "Homenagem",

          sender_name:
            tribute.senderName ||
            content.senderName ||
            tribute.user?.name ||
            "",

          user_email: tribute.user?.email || "",
          user_phone: tribute.user?.phone || "",

          plan_id: plan.id,
          plan_name: plan.name,
          plan_price_cents: plan.priceCents,
          plan_photos: plan.photos,
          plan_duration: plan.duration,
          plan,

          public_url:
            tribute.publicUrl ||
            (tribute.slug ? `/presente/${tribute.slug}` : null),

          expires_at: tribute.expiresAt,
          published_at: tribute.publishedAt,

          photos: tribute.photos || [],
          payments: tribute.payments || [],
          views_count: tribute.views?.length || 0,

          created_at: tribute.createdAt,
          updated_at: tribute.updatedAt,
        };
      }),
    });
  } catch (error) {
    console.error("Erro em GET /api/tributes/list:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao buscar homenagens.",
        tributes: [],
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
