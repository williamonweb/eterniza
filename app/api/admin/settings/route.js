import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import {
  DEFAULT_SYSTEM_SETTINGS,
  SETTINGS_GROUPS,
} from "../../settings/defaults";

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

function sanitizeValue(key, value) {
  const fallback = DEFAULT_SYSTEM_SETTINGS[key];

  if (typeof fallback === "boolean") return Boolean(value);

  if (typeof fallback === "number") {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  }

  return String(value ?? "").trim();
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await ensureSettings();

    const rows = await prisma.systemSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    const settings = { ...DEFAULT_SYSTEM_SETTINGS };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Erro em GET /api/admin/settings:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao buscar configurações." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const incoming = body.settings && typeof body.settings === "object"
      ? body.settings
      : {};

    const entries = Object.keys(DEFAULT_SYSTEM_SETTINGS)
      .filter((key) => Object.prototype.hasOwnProperty.call(incoming, key))
      .map((key) => [key, sanitizeValue(key, incoming[key])]);

    if (!entries.length) {
      return NextResponse.json(
        { ok: false, message: "Nenhuma configuração válida foi enviada." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          create: {
            key,
            group: SETTINGS_GROUPS[key] || "general",
            value,
          },
          update: {
            group: SETTINGS_GROUPS[key] || "general",
            value,
          },
        })
      )
    );

    const rows = await prisma.systemSetting.findMany();
    const settings = { ...DEFAULT_SYSTEM_SETTINGS };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({
      ok: true,
      message: "Configurações atualizadas com sucesso.",
      settings,
    });
  } catch (error) {
    console.error("Erro em POST /api/admin/settings:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao salvar configurações." },
      { status: 500 }
    );
  }
}
