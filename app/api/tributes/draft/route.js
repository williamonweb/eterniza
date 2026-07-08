import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { makeSlug } from "../../../../lib/slug";

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makeUniqueSlug(base) {
  return `${makeSlug(base || "homenagem")}-${Date.now().toString(36)}`;
}

function toLegacyTribute(tribute, user) {
  return {
    id: tribute.id,
    user_id: tribute.userId,
    user_email: user?.email || tribute.user?.email || "",
    category: tribute.category,
    title: tribute.title,
    receiver_name: tribute.receiverName,
    sender_name: tribute.senderName,
    special_date: tribute.specialDate,
    plan_id: tribute.planId,
    plan_name: tribute.planName,
    plan_price_cents: tribute.planPriceCents,
    music: tribute.music || {},
    content: tribute.content || {},
    slug: tribute.slug,
    status: tribute.status === "PUBLISHED" ? "publicado" : tribute.status === "ARCHIVED" ? "arquivado" : "rascunho",
    public_url: tribute.publicUrl,
    expires_at: tribute.expiresAt,
    published_at: tribute.publishedAt,
    created_at: tribute.createdAt,
    updated_at: tribute.updatedAt,
  };
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "Sessão expirada. Entre novamente." }, { status: 401 });
    }

    const body = await req.json();
    const content = body.content || {};
    const tributeId = body.tributeId || content.tributeId || null;
    const receiver = String(content.receiverName || body.receiverName || "").trim();
    const sender = String(content.senderName || body.senderName || "").trim();
    const title = receiver || "Homenagem sem título";
    const category = content.recipient?.id || body.category || null;
    const plan = content.plan || {};
    const music = {
      mode: content.musicMode || null,
      selectedTrack: content.selectedTrack || null,
      youtubeId: content.youtubeId || null,
      youtubeLink: content.youtubeLink || null,
    };

    const data = {
      category,
      title,
      receiverName: receiver || null,
      senderName: sender || null,
      specialDate: normalizeDate(content.specialDate),
      planId: plan.id || null,
      planName: plan.name || null,
      planPriceCents: Number(plan.cents || 0),
      music,
      content,
    };

    let tribute = null;

    if (tributeId) {
      tribute = await prisma.tribute.findFirst({ where: { id: tributeId, userId: user.id } });
      if (tribute) {
        tribute = await prisma.tribute.update({
          where: { id: tribute.id },
          data,
        });
      }
    }

    if (!tribute) {
      const slug = makeUniqueSlug(receiver || sender || title);
      tribute = await prisma.tribute.create({
        data: {
          ...data,
          slug,
          status: "DRAFT",
          publicUrl: `/presente/${slug}`,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ ok: true, tribute: toLegacyTribute(tribute, user) });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || "Erro ao salvar homenagem." }, { status: 500 });
  }
}
