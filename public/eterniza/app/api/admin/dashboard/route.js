import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

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

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysAgo(days) {
  const date = startOfDay();
  date.setDate(date.getDate() - days);
  return date;
}

export async function GET() {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    const now = new Date();
    const today = startOfDay(now);
    const monthStart = startOfMonth(now);
    const last7Days = daysAgo(6);
    const last30Days = daysAgo(29);

    const [
      clients,
      tributes,
      payments,
      recentUsers,
      recentTributes,
      recentPayments,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { role: "CLIENT" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { tributes: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tribute.findMany({
        select: {
          id: true,
          title: true,
          receiverName: true,
          senderName: true,
          planId: true,
          planName: true,
          planPriceCents: true,
          status: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { views: true, photos: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          mercadoPagoId: true,
          tribute: {
            select: {
              id: true,
              title: true,
              receiverName: true,
              planId: true,
              planName: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "CLIENT" },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.tribute.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          receiverName: true,
          status: true,
          slug: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.payment.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          tribute: {
            select: {
              id: true,
              receiverName: true,
              title: true,
              planName: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
      }),
    ]);

    const paidStatuses = new Set(["APPROVED", "RECEIVED", "CONFIRMED"]);
    const isPaid = (payment) =>
      paidStatuses.has(String(payment.status || "").toUpperCase());

    const approvedPayments = payments.filter(isPaid);
    const pendingPayments = payments.filter(
      (payment) => String(payment.status || "").toUpperCase() === "PENDING"
    );

    const revenueTotal = approvedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );
    const revenueToday = approvedPayments
      .filter((payment) => new Date(payment.createdAt) >= today)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const revenueMonth = approvedPayments
      .filter((payment) => new Date(payment.createdAt) >= monthStart)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const chart = Array.from({ length: 30 }, (_, index) => {
      const day = new Date(last30Days);
      day.setDate(last30Days.getDate() + index);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const value = approvedPayments
        .filter((payment) => {
          const createdAt = new Date(payment.createdAt);
          return createdAt >= day && createdAt < nextDay;
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      return {
        date: day.toISOString().slice(0, 10),
        label: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value,
      };
    });

    const planSales = approvedPayments.reduce((map, payment) => {
      const plan =
        payment.tribute?.planName ||
        payment.tribute?.planId ||
        "Não informado";
      map[plan] = (map[plan] || 0) + 1;
      return map;
    }, {});

    const bestPlan =
      Object.entries(planSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "Aguardando vendas";

    const published = tributes.filter(
      (tribute) => String(tribute.status).toUpperCase() === "PUBLISHED"
    ).length;
    const drafts = tributes.filter(
      (tribute) => String(tribute.status).toUpperCase() === "DRAFT"
    ).length;

    const clientsLast7Days = clients.filter(
      (client) => new Date(client.createdAt) >= last7Days
    ).length;
    const activeClients = clients.filter((client) => client._count.tributes > 0).length;

    const conversion =
      tributes.length > 0 ? (published / tributes.length) * 100 : 0;

    const firstSale = approvedPayments[0]
      ? {
          date: approvedPayments[0].createdAt,
          amount: approvedPayments[0].amount,
          client:
            approvedPayments[0].tribute?.user?.name ||
            approvedPayments[0].tribute?.user?.email ||
            "Cliente",
          plan:
            approvedPayments[0].tribute?.planName ||
            approvedPayments[0].tribute?.planId ||
            "Plano",
        }
      : null;

    const activity = [
      ...recentPayments.map((payment) => ({
        type: "payment",
        title: isPaid(payment) ? "Pagamento aprovado" : "Pagamento criado",
        detail: `${payment.tribute?.user?.name || payment.tribute?.user?.email || "Cliente"} • ${payment.tribute?.planName || "Plano"}`,
        date: payment.createdAt,
        value: payment.amount,
        status: payment.status,
      })),
      ...recentUsers.map((client) => ({
        type: "client",
        title: "Novo cliente",
        detail: client.name || client.email,
        date: client.createdAt,
      })),
      ...recentTributes.map((tribute) => ({
        type: "tribute",
        title:
          String(tribute.status).toUpperCase() === "PUBLISHED"
            ? "Homenagem publicada"
            : "Homenagem criada",
        detail: `${tribute.receiverName || tribute.title} • ${tribute.user?.name || tribute.user?.email}`,
        date: tribute.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);

    return NextResponse.json({
      ok: true,
      admin: { name: user.name || "Administrador" },
      metrics: {
        revenueToday,
        revenueMonth,
        revenueTotal,
        averageTicket:
          approvedPayments.length > 0
            ? revenueTotal / approvedPayments.length
            : 0,
        clients: clients.length,
        activeClients,
        clientsLast7Days,
        tributes: tributes.length,
        published,
        drafts,
        pendingPayments: pendingPayments.length,
        approvedPayments: approvedPayments.length,
        bestPlan,
        conversion,
        totalViews: tributes.reduce(
          (sum, tribute) => sum + tribute._count.views,
          0
        ),
      },
      chart,
      firstSale,
      recentPayments,
      recentTributes,
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        totalTributes: client._count.tributes,
        createdAt: client.createdAt,
      })),
      tributes: tributes.map((tribute) => ({
        id: tribute.id,
        receiverName: tribute.receiverName || tribute.title,
        senderName: tribute.senderName || "",
        userName: tribute.user?.name || "",
        userEmail: tribute.user?.email || "",
        planId: tribute.planId,
        planName: tribute.planName,
        planPriceCents: tribute.planPriceCents,
        status: tribute.status,
        slug: tribute.slug,
        views: tribute._count.views,
        photos: tribute._count.photos,
        createdAt: tribute.createdAt,
      })),
      payments: recentPayments,
      activity,
    });
  } catch (error) {
    console.error("Erro em GET /api/admin/dashboard:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao carregar painel." },
      { status: 500 }
    );
  }
}
