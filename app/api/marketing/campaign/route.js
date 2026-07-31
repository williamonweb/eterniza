import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const campaign = await prisma.campaign.findFirst({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({
      ok: true,
      campaign,
      serverTime: now.toISOString(),
      timeZone: "America/Sao_Paulo",
    });
  } catch (error) {
    return NextResponse.json({ ok: false, campaign: null }, { status: 500 });
  }
}
