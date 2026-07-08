import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

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
      tributes: tributes.map((tribute) => ({
        id: tribute.id,
        title: tribute.title,
        category: tribute.category,
        message: tribute.message,
        music: tribute.music,
        status: tribute.status,
        slug: tribute.slug,

        receiver_name: tribute.title || "Homenagem",
        sender_name: tribute.user?.name || "",
        user_email: tribute.user?.email || "",
        user_phone: tribute.user?.phone || "",

        plan_id: "premium",
        plan_name: "Premium",
        plan_price_cents: 0,

        public_url: tribute.slug ? `/presente/${tribute.slug}` : null,

        photos: tribute.photos || [],
        payments: tribute.payments || [],
        views_count: tribute.views?.length || 0,

        created_at: tribute.createdAt,
        updated_at: tribute.updatedAt,
      })),
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