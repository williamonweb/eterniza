import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

const allowedTypes = new Set([
  "FAREWELL",
  "SURGERY",
  "RECOVERY",
  "DISCHARGE",
  "BIRTHDAY",
  "ADOPTION",
  "VACCINATION",
  "CUSTOM",
]);

function slugify(value) {
  return String(value || "experiencia")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 55);
}

function makeSlug(petName) {
  return `${slugify(petName)}-${randomUUID().replace(/-/g, "").slice(0, 9)}`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function clinicUser() {
  const current = await getCurrentUser();
  if (!current) return null;

  return prisma.user.findUnique({
    where: { id: current.id },
    include: { clinic: true },
  });
}

function publicItem(item) {
  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    status: item.status,
    petName: item.petName,
    species: item.species,
    breed: item.breed,
    tutorName: item.tutorName,
    tutorPhone: item.tutorPhone,
    title: item.title,
    message: item.message,
    specialDate: item.specialDate,
    musicUrl: item.musicUrl,
    photos: Array.isArray(item.photos) ? item.photos : [],
    storyAnswers: item.storyAnswers && typeof item.storyAnswers === "object" ? item.storyAnswers : {},
    storyData: item.storyData && typeof item.storyData === "object" ? item.storyData : null,
    themeColor: item.themeColor,
    views: item.views,
    publishedAt: item.publishedAt,
    countedAt: item.countedAt,
    deletedAt: item.deletedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publicUrl: `/pets/experiencia/${item.slug}`,
  };
}

export async function GET() {
  try {
    const user = await clinicUser();

    if (
      !user ||
      user.isActive === false ||
      !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
      user.clinic?.status !== "APPROVED"
    ) {
      return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
    }

    const experiences = await prisma.petExperience.findMany({
      where: { clinicId: user.clinic.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      experiences: experiences.map(publicItem),
    });
  } catch (error) {
    console.error("[pets/experiences GET]", error);
    return NextResponse.json({ ok: false, message: "Erro ao carregar experiências." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await clinicUser();

    if (
      !user ||
      user.isActive === false ||
      !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
      user.clinic?.status !== "APPROVED"
    ) {
      return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const action = String(body.action || "DRAFT").toUpperCase();
    const type = String(body.type || "CUSTOM").toUpperCase();
    const petName = String(body.petName || "").trim();
    const tutorName = String(body.tutorName || "").trim();
    const message = String(body.message || "").trim();
    const title = String(body.title || "").trim() || `Um momento especial de ${petName}`;
    const photos = Array.isArray(body.photos) ? body.photos.slice(0, 5) : [];
    const storyAnswers = body.storyAnswers && typeof body.storyAnswers === "object" ? body.storyAnswers : {};
    const storyData = body.storyData && typeof body.storyData === "object" ? body.storyData : null;

    if (!allowedTypes.has(type)) {
      return NextResponse.json({ ok: false, message: "Tipo de experiência inválido." }, { status: 400 });
    }

    if (!petName || !tutorName || !message) {
      return NextResponse.json(
        { ok: false, message: "Informe nome do pet, tutor e mensagem." },
        { status: 400 }
      );
    }

    const publish = action === "PUBLISH";

    if (publish && Number(user.clinic.monthlyTributeLimit || 0) > 0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const used = await prisma.petExperience.count({
        where: {
          clinicId: user.clinic.id,
          OR: [
            { countedAt: { gte: monthStart } },
            { countedAt: null, publishedAt: { gte: monthStart } },
          ],
        },
      });

      if (used >= Number(user.clinic.monthlyTributeLimit)) {
        return NextResponse.json(
          { ok: false, message: "O limite mensal do pacote foi atingido." },
          { status: 409 }
        );
      }
    }

    const experience = await prisma.petExperience.create({
      data: {
        slug: makeSlug(petName),
        type,
        status: publish ? "PUBLISHED" : "DRAFT",
        petName,
        species: String(body.species || "").trim() || null,
        breed: String(body.breed || "").trim() || null,
        tutorName,
        tutorPhone: String(body.tutorPhone || "").replace(/\D/g, "").slice(0, 11) || null,
        title,
        message,
        specialDate: parseDate(body.specialDate),
        musicUrl: String(body.musicUrl || "").trim() || null,
        photos,
        storyAnswers,
        storyData,
        themeColor: String(body.themeColor || user.clinic.primaryColor || "#277ed4"),
        clinicId: user.clinic.id,
        createdById: user.id,
        publishedAt: publish ? new Date() : null,
        countedAt: publish ? new Date() : null,
      },
    });

    return NextResponse.json(
      { ok: true, experience: publicItem(experience) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[pets/experiences POST]", error);
    return NextResponse.json({ ok: false, message: "Erro ao salvar experiência." }, { status: 500 });
  }
}
