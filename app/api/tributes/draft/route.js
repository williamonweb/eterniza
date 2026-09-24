import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { makeSlug } from "../../../../lib/slug";
import { getPlanBySlug, getPlans } from "../../../../lib/asaas";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "../../../../lib/password";
import { grantGuestAccess, hasGuestAccess } from "../../../../lib/normal/guestAccess";

export const dynamic = "force-dynamic";

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

export async function GET(req) {
  const user = await getCurrentUser();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, message: "Página não informada." }, { status: 400 });
  const tribute = await prisma.tribute.findUnique({ where: { id }, include: { user: { select: { email: true } } } });
  if (!tribute || (tribute.userId !== user?.id && !hasGuestAccess(tribute))) return NextResponse.json({ ok: false, message: "Página não encontrada neste navegador." }, { status: 404 });
  return NextResponse.json({ ok: true, tribute: toLegacyTribute(tribute, user) });
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    const body = await req.json();
    const content = body.content || {};
    const tributeId = body.tributeId || content.tributeId || null;
    const receiver = String(content.receiverName || body.receiverName || "").trim();
    const sender = String(content.senderName || body.senderName || "").trim();
    const title = String(content.title || receiver || "Página sem título").trim().slice(0, 160);
    const category = content.recipient?.id || body.category || null;
    const requestedPlan = content.plan || {};
    const planSlug = String(requestedPlan.slug || requestedPlan.id || '').trim().toLowerCase();
    const plan = planSlug ? await getPlanBySlug(planSlug) : null;
    const photos = Array.isArray(content.photos) ? content.photos.filter(Boolean) : [];

    if (planSlug && !plan) {
      return NextResponse.json({ ok: false, message: "Escolha um plano válido antes de salvar a homenagem." }, { status: 400 });
    }

    const photoLimit = plan ? Number(plan.photos || 0) : Math.max(0, ...(await getPlans()).map(item => Number(item.photos || 0)));
    if (!photoLimit || photos.length > photoLimit) {
      return NextResponse.json(
        { ok: false, message: plan ? `O plano ${plan.name} permite até ${photoLimit} fotos.` : `É possível adicionar até ${photoLimit} fotos.` },
        { status: 400 }
      );
    }

    const normalizedContent = {
      ...content,
      plan: plan ? {
        ...requestedPlan,
        id: plan.slug || requestedPlan.id,
        slug: plan.slug || requestedPlan.slug || requestedPlan.id,
        name: plan.name,
        cents: Math.round(Number(plan.price || 0) * 100),
        photos: photoLimit,
        duration: plan.duration || requestedPlan.duration,
      } : null,
      photos,
    };

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
      planId: plan?.slug || null,
      planName: plan?.name || null,
      planPriceCents: Math.round(Number(plan?.price || 0) * 100),
      music,
      content: normalizedContent,
    };

    let tribute = null;
    let ownerId = user?.id;

    if (tributeId) {
      tribute = await prisma.tribute.findUnique({ where: { id: tributeId }, include: { user: { select: { email: true } } } });
      if (tribute && tribute.userId !== user?.id && !hasGuestAccess(tribute)) tribute = null;
      if (tribute?.status === "PUBLISHED") return NextResponse.json({ ok: false, message: "Uma página publicada não pode ser alterada como rascunho." }, { status: 409 });
      if (tribute) {
        ownerId = tribute.userId;
        tribute = await prisma.tribute.update({
          where: { id: tribute.id },
          data,
        });
      }
    }

    if (tributeId && !tribute) return NextResponse.json({ ok: false, message: "Rascunho não encontrado nesta conta." }, { status: 404 });
    if (!tribute) {
      if (!ownerId) {
        const guest = await prisma.user.create({ data: {
          name: "Visitante Eterniza",
          email: `guest-${randomUUID()}@guest.eternizas.invalid`,
          password: await hashPassword(randomBytes(32).toString('hex')),
          role: "CLIENT",
        } });
        ownerId = guest.id;
      }
      const slug = makeUniqueSlug(receiver || sender || title);
      tribute = await prisma.tribute.create({
        data: {
          ...data,
          slug,
          status: "DRAFT",
          publicUrl: `/presente/${slug}`,
          userId: ownerId,
        },
      });
    }

    const response = NextResponse.json({ ok: true, tribute: toLegacyTribute(tribute, user) });
    return user?.id === ownerId ? response : grantGuestAccess(response, tribute);
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || "Erro ao salvar homenagem." }, { status: 500 });
  }
}
