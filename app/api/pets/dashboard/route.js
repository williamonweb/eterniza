import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, publicUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  try {
    const current = await getCurrentUser();

    if (!current) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: current.id },
      include: {
        clinic: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (
      !user ||
      !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
      user.clinic?.status !== "APPROVED"
    ) {
      return NextResponse.json(
        { ok: false, message: "Acesso de clínica não autorizado." },
        { status: 403 }
      );
    }

    const clinic = user.clinic;
    const monthStart = startOfMonth();

    const [
      createdThisMonth,
      publishedThisMonth,
      draftThisMonth,
      total,
      viewsAggregate,
      recentRows,
      consumedThisMonth,
    ] = await Promise.all([
      prisma.petExperience.count({
        where: { clinicId: clinic.id, deletedAt: null, createdAt: { gte: monthStart } },
      }),
      prisma.petExperience.count({
        where: {
          clinicId: clinic.id,
          deletedAt: null,
          status: "PUBLISHED",
          publishedAt: { gte: monthStart },
        },
      }),
      prisma.petExperience.count({
        where: { clinicId: clinic.id, deletedAt: null, status: "DRAFT" },
      }),
      prisma.petExperience.count({
        where: { clinicId: clinic.id, deletedAt: null },
      }),
      prisma.petExperience.aggregate({
        where: { clinicId: clinic.id, deletedAt: null, updatedAt: { gte: monthStart } },
        _sum: { views: true },
      }),
      prisma.petExperience.findMany({
        where: { clinicId: clinic.id, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          petName: true,
          type: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.petExperience.count({
        where: {
          clinicId: clinic.id,
          OR: [
            { countedAt: { gte: monthStart } },
            { countedAt: null, publishedAt: { gte: monthStart } },
          ],
        },
      }),
    ]);

    const iconByType = {
      FAREWELL: "🌈",
      SURGERY: "🩺",
      RECOVERY: "❤️",
      DISCHARGE: "🏥",
      BIRTHDAY: "🎂",
      ADOPTION: "🏠",
      VACCINATION: "💉",
      CUSTOM: "✨",
    };

    const usage = {
      createdThisMonth,
      publishedThisMonth,
      draftThisMonth,
      total,
      viewsThisMonth: Number(viewsAggregate._sum.views || 0),
      recent: recentRows.map((item) => ({
        ...item,
        icon: iconByType[item.type] || "🐾",
      })),
      monthStart: monthStart.toISOString(),
    };

    const limit = Number(clinic.monthlyTributeLimit || 0);
    const used = Number(consumedThisMonth || 0);
    const remaining = limit > 0 ? Math.max(0, limit - used) : null;
    const progress = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

    return NextResponse.json(
      {
        ok: true,
        user: publicUser(user),
        clinic: {
          id: clinic.id,
          code: clinic.code,
          tradeName: clinic.tradeName,
          legalName: clinic.legalName,
          status: clinic.status,
          logoUrl: clinic.logoUrl,
          primaryColor: clinic.primaryColor,
          monthlyPackageName: clinic.monthlyPackageName,
          monthlyPriceCents: clinic.monthlyPriceCents,
          monthlyTributeLimit: clinic.monthlyTributeLimit,
          billingDay: clinic.billingDay,
          showEternizaBrand: clinic.showEternizaBrand,
          showEternizaCta: clinic.showEternizaCta,
          city: clinic.city,
          state: clinic.state,
        },
        package: {
          name: clinic.monthlyPackageName || "Pacote mensal",
          priceCents: Number(clinic.monthlyPriceCents || 0),
          limit,
          used,
          remaining,
          progress,
          billingDay: Number(clinic.billingDay || 10),
        },
        metrics: {
          createdThisMonth: usage.createdThisMonth,
          publishedThisMonth: usage.publishedThisMonth,
          draftThisMonth: usage.draftThisMonth,
          total: usage.total,
          viewsThisMonth: usage.viewsThisMonth,
          teamMembers: clinic.users.length,
        },
        team: clinic.users,
        recent: usage.recent,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[pets/dashboard]", error);

    return NextResponse.json(
      { ok: false, message: "Não foi possível carregar o painel da clínica." },
      { status: 500 }
    );
  }
}
