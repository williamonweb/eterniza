import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  DEFAULT_SYSTEM_SETTINGS,
  SETTINGS_GROUPS,
} from "./defaults";

export const dynamic = "force-dynamic";

async function ensureSettings() {
  await Promise.all(
    Object.entries(DEFAULT_SYSTEM_SETTINGS).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: {},
        create: {
          key,
          group: SETTINGS_GROUPS[key] || "general",
          value,
        },
      })
    )
  );
}

export async function GET() {
  try {
    await ensureSettings();

    const rows = await prisma.systemSetting.findMany();
    const settings = { ...DEFAULT_SYSTEM_SETTINGS };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json(
      { ok: true, settings },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Erro em GET /api/settings:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao carregar configurações.",
        settings: DEFAULT_SYSTEM_SETTINGS,
      },
      { status: 500 }
    );
  }
}
