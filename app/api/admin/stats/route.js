import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { hasAdminPermission } from "../../../../lib/adminPermissions";

async function handler() {
  try {
    const user = await getCurrentUser();
    if (!user || !hasAdminPermission(user, "analytics")) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const [clientes, homenagens, publicados, receita] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.tribute.count(),
      prisma.tribute.count({ where: { status: "PUBLISHED" } }),
      prisma.payment.aggregate({ where: { status: "aprovado" }, _sum: { amount: true } }),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        clientes,
        homenagens,
        publicados,
        receita_cents: Math.round(Number(receita._sum.amount || 0) * 100),
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}

export async function GET() {
  return handler();
}

export async function POST() {
  return handler();
}
