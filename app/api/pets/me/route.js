import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser, publicUser } from "../../../../lib/auth";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: current.id },
      include: { clinic: true },
    });

    if (!user || !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) || user.clinic?.status !== "APPROVED") {
      return NextResponse.json({ ok: false, message: "Acesso de clínica não autorizado." }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      user: publicUser(user),
      clinic: user.clinic,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Erro ao carregar a clínica." }, { status: 500 });
  }
}
