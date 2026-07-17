import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const slug = String(params?.slug || "").trim();

    const experience = await prisma.petExperience.findUnique({
      where: { slug },
      include: {
        clinic: {
          select: {
            tradeName: true,
            logoUrl: true,
            primaryColor: true,
            signature: true,
            showEternizaBrand: true,
            showEternizaCta: true,
            eternizaCtaText: true,
            eternizaCtaUrl: true,
          },
        },
      },
    });

    if (!experience || experience.status !== "PUBLISHED" || experience.deletedAt) {
      return NextResponse.json(
        { ok: false, message: "Experiência não encontrada." },
        { status: 404 }
      );
    }

    await prisma.petExperience.update({
      where: { id: experience.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      experience: {
        id: experience.id,
        slug: experience.slug,
        type: experience.type,
        petName: experience.petName,
        species: experience.species,
        breed: experience.breed,
        tutorName: experience.tutorName,
        title: experience.title,
        message: experience.message,
        specialDate: experience.specialDate,
        musicUrl: experience.musicUrl,
        photos: Array.isArray(experience.photos) ? experience.photos : [],
        themeColor: experience.themeColor,
        clinic: experience.clinic,
        publishedAt: experience.publishedAt,
      },
    });
  } catch (error) {
    console.error("[pets/public experience]", error);
    return NextResponse.json({ ok: false, message: "Erro ao abrir experiência." }, { status: 500 });
  }
}
