import { NextResponse } from "next/server";
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
    return NextResponse.json({ ok: true, campaign });
  } catch (error) {
    return NextResponse.json({ ok: false, campaign: null }, { status: 500 });
  }
}
