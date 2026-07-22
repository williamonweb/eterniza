import { NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/password";
import { prisma } from "../../../../lib/prisma";
import { normalizePermissions } from "../../../../lib/pets/team-permissions";
import {
  cleanEmail,
  cleanPhone,
  getClinicTeamContext,
  serializeTeamMember,
} from "../../../../lib/pets/team-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getClinicTeamContext("team.view");
    if (!context) {
      return NextResponse.json({ ok: false, message: "Você não possui acesso à equipe." }, { status: 403 });
    }

    const members = await prisma.user.findMany({
      where: {
        clinicId: context.clinic.id,
        role: { in: ["CLINIC_MANAGER", "CLINIC_STAFF"] },
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({
      ok: true,
      currentUserId: context.user.id,
      canManage: context.user.role === "CLINIC_MANAGER" || Boolean(context.user.permissions?.team?.manage),
      members: members.map(serializeTeamMember),
    });
  } catch (error) {
    console.error("[pets/team GET]", error);
    return NextResponse.json({ ok: false, message: "Erro ao carregar a equipe." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const context = await getClinicTeamContext("team.manage");
    if (!context) {
      return NextResponse.json({ ok: false, message: "Você não possui permissão para cadastrar integrantes." }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = cleanEmail(body.email);
    const phone = cleanPhone(body.phone);
    const password = String(body.password || "");
    const role = body.role === "CLINIC_MANAGER" ? "CLINIC_MANAGER" : "CLINIC_STAFF";
    const clinicTitle = String(body.clinicTitle || "").trim().slice(0, 80) || null;
    const notes = String(body.notes || "").trim().slice(0, 2000) || null;

    if (name.length < 2 || !email.includes("@")) {
      return NextResponse.json({ ok: false, message: "Informe nome e e-mail válidos." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }
    if (role === "CLINIC_MANAGER" && context.user.role !== "CLINIC_MANAGER") {
      return NextResponse.json({ ok: false, message: "Apenas administradores podem criar outro administrador." }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ ok: false, message: "Este e-mail já está cadastrado no Eterniza." }, { status: 409 });
    }

    const member = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: await hashPassword(password),
        role,
        clinicId: context.clinic.id,
        clinicTitle,
        notes,
        isActive: true,
        permissions: normalizePermissions(body.permissions, role),
      },
    });

    return NextResponse.json({ ok: true, member: serializeTeamMember(member) }, { status: 201 });
  } catch (error) {
    console.error("[pets/team POST]", error);
    return NextResponse.json({ ok: false, message: "Erro ao cadastrar integrante." }, { status: 500 });
  }
}
