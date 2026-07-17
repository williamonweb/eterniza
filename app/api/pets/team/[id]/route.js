import { NextResponse } from "next/server";
import { hashPassword } from "../../../../../lib/password";
import { prisma } from "../../../../../lib/prisma";
import { normalizePermissions } from "../../../../../lib/pets/team-permissions";
import {
  cleanEmail,
  cleanPhone,
  getClinicTeamContext,
  serializeTeamMember,
} from "../../../../../lib/pets/team-server";

async function targetForClinic(id, clinicId) {
  return prisma.user.findFirst({
    where: {
      id,
      clinicId,
      role: { in: ["CLINIC_MANAGER", "CLINIC_STAFF"] },
    },
  });
}

async function activeManagerCount(clinicId) {
  return prisma.user.count({
    where: { clinicId, role: "CLINIC_MANAGER", isActive: true },
  });
}

export async function PATCH(request, { params }) {
  try {
    const context = await getClinicTeamContext("team.manage");
    if (!context) {
      return NextResponse.json({ ok: false, message: "Você não possui permissão para alterar a equipe." }, { status: 403 });
    }

    const id = String(params?.id || "");
    const target = await targetForClinic(id, context.clinic.id);
    if (!target) {
      return NextResponse.json({ ok: false, message: "Integrante não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const action = String(body.action || "UPDATE").toUpperCase();

    if (target.role === "CLINIC_MANAGER" && context.user.role !== "CLINIC_MANAGER") {
      return NextResponse.json(
        { ok: false, message: "Apenas administradores podem alterar outro administrador." },
        { status: 403 }
      );
    }

    if (action === "TOGGLE_STATUS") {
      if (target.id === context.user.id) {
        return NextResponse.json({ ok: false, message: "Você não pode desativar o próprio acesso." }, { status: 409 });
      }
      if (target.role === "CLINIC_MANAGER" && target.isActive && (await activeManagerCount(context.clinic.id)) <= 1) {
        return NextResponse.json({ ok: false, message: "A clínica precisa manter pelo menos um administrador ativo." }, { status: 409 });
      }

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: { isActive: !target.isActive },
      });
      return NextResponse.json({ ok: true, member: serializeTeamMember(updated) });
    }

    if (action === "RESET_PASSWORD") {
      const password = String(body.password || "");
      if (password.length < 6) {
        return NextResponse.json({ ok: false, message: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: target.id },
        data: { password: await hashPassword(password) },
      });
      return NextResponse.json({ ok: true, message: "Senha atualizada com sucesso." });
    }

    const name = String(body.name || "").trim();
    const email = cleanEmail(body.email);
    const phone = cleanPhone(body.phone);
    const role = body.role === "CLINIC_MANAGER" ? "CLINIC_MANAGER" : "CLINIC_STAFF";

    if (name.length < 2 || !email.includes("@")) {
      return NextResponse.json({ ok: false, message: "Informe nome e e-mail válidos." }, { status: 400 });
    }
    if (role === "CLINIC_MANAGER" && context.user.role !== "CLINIC_MANAGER") {
      return NextResponse.json({ ok: false, message: "Apenas administradores podem conceder este perfil." }, { status: 403 });
    }
    if (target.role === "CLINIC_MANAGER" && role !== "CLINIC_MANAGER" && target.isActive && (await activeManagerCount(context.clinic.id)) <= 1) {
      return NextResponse.json({ ok: false, message: "A clínica precisa manter pelo menos um administrador ativo." }, { status: 409 });
    }

    const duplicate = await prisma.user.findFirst({
      where: { email, id: { not: target.id } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ ok: false, message: "Este e-mail já está cadastrado no Eterniza." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        name,
        email,
        phone: phone || null,
        role,
        clinicTitle: String(body.clinicTitle || "").trim().slice(0, 80) || null,
        notes: String(body.notes || "").trim().slice(0, 2000) || null,
        permissions: normalizePermissions(body.permissions, role),
      },
    });

    return NextResponse.json({ ok: true, member: serializeTeamMember(updated) });
  } catch (error) {
    console.error("[pets/team PATCH]", error);
    return NextResponse.json({ ok: false, message: "Erro ao atualizar integrante." }, { status: 500 });
  }
}
