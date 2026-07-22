import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || String(user.role).toUpperCase() !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  const clinics = await prisma.clinic.findMany({
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, clinics });
}

export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const action = String(body.action || "").toUpperCase();
    if (!id) return NextResponse.json({ ok: false, message: "Clínica inválida." }, { status: 400 });

    const data = {};
    if (action === "APPROVE") {
      data.status = "APPROVED";
      data.approvedAt = new Date();
      data.approvedById = admin.id;
      data.rejectionReason = null;
      data.monthlyPackageName = String(body.monthlyPackageName || "Pacote mensal");
      data.monthlyPriceCents = Math.max(0, Number(body.monthlyPriceCents || 0));
      data.monthlyTributeLimit = Math.max(0, Number(body.monthlyTributeLimit || 0));
      data.billingDay = Math.min(28, Math.max(1, Number(body.billingDay || 10)));
    } else if (action === "REJECT") {
      data.status = "REJECTED";
      data.rejectionReason = String(body.reason || "Cadastro não aprovado.");
    } else if (action === "SUSPEND") {
      data.status = "SUSPENDED";
    } else if (action === "REACTIVATE") {
      data.status = "APPROVED";
      data.rejectionReason = null;
    } else if (action === "UPDATE") {
      data.monthlyPackageName = String(body.monthlyPackageName || "Pacote mensal");
      data.monthlyPriceCents = Math.max(0, Number(body.monthlyPriceCents || 0));
      data.monthlyTributeLimit = Math.max(0, Number(body.monthlyTributeLimit || 0));
      data.billingDay = Math.min(28, Math.max(1, Number(body.billingDay || 10)));
      data.showEternizaBrand = body.showEternizaBrand !== false;
      data.showEternizaCta = body.showEternizaCta !== false;
      data.eternizaCtaText = String(body.eternizaCtaText || "Conheça o Eterniza");
      data.eternizaCtaUrl = String(body.eternizaCtaUrl || "https://eternizas.com.br");
    } else {
      return NextResponse.json({ ok: false, message: "Ação inválida." }, { status: 400 });
    }

    const clinic = await prisma.clinic.update({ where: { id }, data });
    return NextResponse.json({ ok: true, clinic, message: "Clínica atualizada." });
  } catch (error) {
    console.error("[admin/pets/clinics]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível atualizar a clínica." }, { status: 500 });
  }
}
