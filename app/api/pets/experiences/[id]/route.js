import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";

async function context(id) {
  const current = await getCurrentUser();
  if (!current) return null;

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    include: { clinic: true },
  });

  if (
    !user ||
    !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
    user.clinic?.status !== "APPROVED"
  ) {
    return null;
  }

  const experience = await prisma.petExperience.findFirst({
    where: { id, clinicId: user.clinic.id, deletedAt: null },
  });

  return { user, experience };
}

export async function PATCH(request, { params }) {
  try {
    const ctx = await context(String(params?.id || ""));
    if (!ctx?.experience) {
      return NextResponse.json({ ok: false, message: "Experiência não encontrada." }, { status: 404 });
    }

    const body = await request.json();
    const action = String(body.action || "").toUpperCase();

    if (action === "PUBLISH") {
      if (ctx.experience.status === "PUBLISHED") {
        return NextResponse.json({ ok: true, experience: ctx.experience });
      }

      const limit = Number(ctx.user.clinic.monthlyTributeLimit || 0);
      if (limit > 0) {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const used = await prisma.petExperience.count({
          where: {
            clinicId: ctx.user.clinic.id,
            OR: [
              { countedAt: { gte: monthStart } },
              { countedAt: null, publishedAt: { gte: monthStart } },
            ],
          },
        });

        if (used >= limit) {
          return NextResponse.json(
            { ok: false, message: "O limite mensal do pacote foi atingido." },
            { status: 409 }
          );
        }
      }

      const updated = await prisma.petExperience.update({
        where: { id: ctx.experience.id },
        data: {
          status: "PUBLISHED",
          publishedAt: ctx.experience.publishedAt || new Date(),
          countedAt: ctx.experience.countedAt || ctx.experience.publishedAt || new Date(),
        },
      });

      return NextResponse.json({ ok: true, experience: updated });
    }

    if (action === "ARCHIVE") {
      const updated = await prisma.petExperience.update({
        where: { id: ctx.experience.id },
        data: { status: "ARCHIVED" },
      });
      return NextResponse.json({ ok: true, experience: updated });
    }

    return NextResponse.json({ ok: false, message: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Erro ao atualizar experiência." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ctx = await context(String(params?.id || ""));

    if (!ctx?.experience) {
      return NextResponse.json(
        { ok: false, message: "Experiência não encontrada." },
        { status: 404 }
      );
    }

    await prisma.petExperience.update({
      where: { id: ctx.experience.id },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      usageRefunded: false,
      message: "Experiência removida da lista. O uso do pacote não foi devolvido.",
    });
  } catch (error) {
    console.error("[pets/experiences DELETE]", error);

    return NextResponse.json(
      { ok: false, message: "Erro ao remover experiência." },
      { status: 500 }
    );
  }
}
