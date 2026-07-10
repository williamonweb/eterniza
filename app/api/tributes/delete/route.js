import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Sessão expirada. Entre novamente." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tributeId = String(body.tributeId || "").trim();

    if (!tributeId) {
      return NextResponse.json(
        { ok: false, message: "História não informada." },
        { status: 400 }
      );
    }

    const tribute = await prisma.tribute.findFirst({
      where: {
        id: tributeId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!tribute) {
      return NextResponse.json(
        { ok: false, message: "História não encontrada ou sem permissão." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({
        where: { tributeId: tribute.id },
      });

      await tx.tribute.delete({
        where: { id: tribute.id },
      });
    });

    return NextResponse.json({ ok: true, deletedId: tribute.id });
  } catch (error) {
    console.error("[tributes/delete]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Não foi possível excluir a história. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
