import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import { hasAdminPermission } from "../../../../../lib/adminPermissions";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !hasAdminPermission(user, "petsFinance")) return null;
  return user;
}

function normalizedStatus(invoice) {
  if (invoice.status === "PENDING" && new Date(invoice.dueDate) < new Date()) return "OVERDUE";
  return invoice.status;
}

function receiptNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `EP-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  const [invoices, clinics] = await Promise.all([
    prisma.clinicInvoice.findMany({
      include: { clinic: { select: { id: true, code: true, tradeName: true, legalName: true, cnpj: true, email: true, phone: true } } },
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.clinic.findMany({
      where: { status: "APPROVED" },
      select: { id: true, code: true, tradeName: true, monthlyPackageName: true, monthlyPriceCents: true, billingDay: true },
      orderBy: { tradeName: "asc" },
    }),
  ]);

  const normalized = invoices.map((item) => ({ ...item, status: normalizedStatus(item) }));
  const paid = normalized.filter((item) => item.status === "PAID");
  const pending = normalized.filter((item) => item.status === "PENDING");
  const overdue = normalized.filter((item) => item.status === "OVERDUE");
  const monthKey = new Date().toISOString().slice(0, 7);

  return NextResponse.json({
    ok: true,
    invoices: normalized,
    clinics,
    metrics: {
      receivedCents: paid.reduce((sum, item) => sum + item.amountCents, 0),
      monthReceivedCents: paid.filter((item) => item.paidAt && String(item.paidAt).slice(0, 7) === monthKey).reduce((sum, item) => sum + item.amountCents, 0),
      pendingCents: pending.reduce((sum, item) => sum + item.amountCents, 0),
      overdueCents: overdue.reduce((sum, item) => sum + item.amountCents, 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    },
  });
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  try {
    const body = await request.json();
    const clinicId = String(body.clinicId || "");
    const competency = String(body.competency || "");
    if (!/^\d{4}-\d{2}$/.test(competency)) return NextResponse.json({ ok: false, message: "Competência inválida." }, { status: 400 });

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) return NextResponse.json({ ok: false, message: "Clínica não encontrada." }, { status: 404 });

    const billingDay = Math.min(28, Math.max(1, Number(body.billingDay || clinic.billingDay || 10)));
    const [year, month] = competency.split("-").map(Number);
    const dueDate = body.dueDate ? new Date(body.dueDate) : new Date(year, month - 1, billingDay, 12, 0, 0);
    const amountCents = Math.max(0, Number(body.amountCents ?? clinic.monthlyPriceCents ?? 0));

    const invoice = await prisma.clinicInvoice.create({
      data: {
        clinicId,
        competency,
        amountCents,
        dueDate,
        description: String(body.description || `Mensalidade ${clinic.monthlyPackageName || "Eterniza Pets"}`),
        notes: body.notes ? String(body.notes) : null,
      },
      include: { clinic: true },
    });

    return NextResponse.json({ ok: true, invoice, message: "Mensalidade criada." });
  } catch (error) {
    if (String(error?.code) === "P2002") return NextResponse.json({ ok: false, message: "Já existe uma mensalidade para esta clínica e competência." }, { status: 409 });
    console.error("[admin/pets/finance POST]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível criar a mensalidade." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const action = String(body.action || "").toUpperCase();
    if (!id) return NextResponse.json({ ok: false, message: "Cobrança inválida." }, { status: 400 });

    let data;
    if (action === "MARK_PAID") {
      const allowedMethods = new Set(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "TRANSFERENCIA", "BOLETO", "OUTRO"]);
      const paymentMethod = String(body.paymentMethod || "").toUpperCase();
      if (!allowedMethods.has(paymentMethod)) {
        return NextResponse.json({ ok: false, message: "Selecione uma forma de pagamento válida." }, { status: 400 });
      }

      const paidAt = body.paidAt ? new Date(`${body.paidAt}T12:00:00`) : new Date();
      if (Number.isNaN(paidAt.getTime())) {
        return NextResponse.json({ ok: false, message: "Data de pagamento inválida." }, { status: 400 });
      }

      data = {
        status: "PAID",
        paidAt,
        paymentMethod,
        receiptNumber: body.receiptNumber || receiptNumber(),
        notes: body.notes === undefined ? undefined : (String(body.notes).trim() || null),
      };
    } else if (action === "REOPEN") {
      data = { status: "PENDING", paidAt: null, paymentMethod: null, receiptNumber: null };
    } else if (action === "CANCEL") {
      data = { status: "CANCELLED" };
    } else {
      return NextResponse.json({ ok: false, message: "Ação inválida." }, { status: 400 });
    }

    const invoice = await prisma.clinicInvoice.update({ where: { id }, data, include: { clinic: true } });
    return NextResponse.json({ ok: true, invoice, message: action === "MARK_PAID" ? "Pagamento confirmado e recibo liberado." : "Cobrança atualizada." });
  } catch (error) {
    console.error("[admin/pets/finance PATCH]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível atualizar a cobrança." }, { status: 500 });
  }
}
