import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tributeId = String(body.tributeId || "").trim();

    if (!tributeId) {
      return NextResponse.json(
        { ok: false, message: "Homenagem não informada." },
        { status: 400 }
      );
    }

    const tribute = await prisma.tribute.findFirst({
      where: user.role === "ADMIN" ? { id: tributeId } : { id: tributeId, userId: user.id },
      select: { id: true },
    });

    if (!tribute) {
      return NextResponse.json(
        { ok: false, message: "Homenagem não encontrada." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { tributeId } });
      await tx.view.deleteMany({ where: { tributeId } });
      await tx.photo.deleteMany({ where: { tributeId } });
      await tx.tribute.delete({ where: { id: tributeId } });
    });

    return NextResponse.json({
      ok: true,
      message: "Homenagem excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro em POST /api/tributes/delete:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Erro ao excluir homenagem.",
      },
      { status: 500 }
    );
  }
}
