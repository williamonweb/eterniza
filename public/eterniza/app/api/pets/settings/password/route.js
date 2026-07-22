import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import { hashPassword, verifyPassword } from "../../../../../lib/password";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const current = await getCurrentUser();
    if (!current?.id || current.isActive === false || !current.clinicId) {
      return NextResponse.json({ ok: false, message: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, message: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, message: "A confirmação da nova senha não confere." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: current.id }, select: { id: true, password: true, isActive: true } });
    if (!user || user.isActive === false || !(await verifyPassword(currentPassword, user.password))) {
      return NextResponse.json({ ok: false, message: "A senha atual está incorreta." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(newPassword) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[pets/settings/password]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível alterar a senha." }, { status: 500 });
  }
}
