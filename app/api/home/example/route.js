import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.systemSetting.findMany({ where: { key: { in: ["homeV2ShowExample", "homeV2ExampleSlug"] } } });
    const settings = Object.fromEntries(rows.map(({ key, value }) => [key, value]));
    const slug = String(settings.homeV2ExampleSlug || "").trim();
    if (settings.homeV2ShowExample !== true || !slug) return NextResponse.json({ ok: true, example: null });

    const tribute = await prisma.tribute.findUnique({
      where: { slug },
      select: { slug: true, title: true, category: true, status: true, message: true, content: true },
    });
    if (!tribute || tribute.status !== "PUBLISHED" || tribute.content?.builderVersion !== "2.0") {
      return NextResponse.json({ ok: true, example: null });
    }
    const photo = tribute.content?.photos?.[0];
    return NextResponse.json({ ok: true, example: {
      slug: tribute.slug,
      title: tribute.title,
      category: tribute.category,
      excerpt: String(tribute.message || tribute.content?.message || "").slice(0, 170),
      photo: typeof photo === "string" ? photo : photo?.url || null,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro em GET /api/home/example:", error);
    return NextResponse.json({ ok: false, example: null }, { status: 500 });
  }
}
