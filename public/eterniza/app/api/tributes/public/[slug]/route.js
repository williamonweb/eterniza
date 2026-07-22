import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(_req, { params }) {
  try {
    const slug = String(params?.slug || "").trim();

    if (!slug) {
      return NextResponse.json(
        { ok: false, message: "Slug não informado." },
        { status: 400 }
      );
    }

    const tribute = await prisma.tribute.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        photos: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            url: true,
            caption: true,
            order: true,
          },
        },
      },
    });

    if (!tribute || String(tribute.status || "").toUpperCase() !== "PUBLISHED") {
      return NextResponse.json(
        { ok: false, message: "Homenagem não encontrada ou ainda não publicada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      tribute: {
        id: tribute.id,
        slug: tribute.slug,
        title: tribute.title,
        category: tribute.category,
        message: tribute.message,
        music: tribute.music,
        content: tribute.content || {},
        status: tribute.status,
        receiver_name: tribute.receiverName || tribute.title || "Homenagem",
        sender_name: tribute.senderName || tribute.user?.name || "",
        special_date: tribute.specialDate,
        public_url: tribute.publicUrl || `/presente/${tribute.slug}`,
        photos: tribute.photos || [],
        created_at: tribute.createdAt,
        updated_at: tribute.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erro em GET /api/tributes/public/[slug]:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao abrir homenagem." },
      { status: 500 }
    );
  }
}
