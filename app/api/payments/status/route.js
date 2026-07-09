import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getAsaasPayment } from "../../../../lib/asaas";

function normalizeAsaasStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(normalized)) return "APPROVED";
  if (["REFUNDED"].includes(normalized)) return "REFUNDED";
  if (["OVERDUE", "DELETED", "CANCELLED"].includes(normalized)) return "CANCELLED";
  return "PENDING";
}

export async function GET(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });
    }

    const url = new URL(req.url);
    const asaasId = String(url.searchParams.get("asaasId") || url.searchParams.get("paymentId") || "").trim();
    const tributeId = String(url.searchParams.get("tributeId") || "").trim();

    if (!asaasId && !tributeId) {
      return NextResponse.json({ ok: false, message: "Pagamento não informado." }, { status: 400 });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: asaasId
        ? { mercadoPagoId: asaasId }
        : { tributeId },
      include: { tribute: true },
      orderBy: { createdAt: "desc" },
    });

    if (!existingPayment || existingPayment.tribute.userId !== user.id) {
      return NextResponse.json({ ok: false, message: "Pagamento não encontrado." }, { status: 404 });
    }

    const asaasPayment = await getAsaasPayment(existingPayment.mercadoPagoId);
    const paymentStatus = normalizeAsaasStatus(asaasPayment.status);

    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: paymentStatus },
    });

    let published = false;

    if (paymentStatus === "APPROVED") {
      await prisma.tribute.update({
        where: { id: existingPayment.tributeId },
        data: { status: "PUBLISHED" },
      });
      published = true;
    }

    const tribute = await prisma.tribute.findUnique({
      where: { id: existingPayment.tributeId },
      select: { id: true, slug: true, status: true },
    });

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      asaasId: existingPayment.mercadoPagoId,
      asaasStatus: asaasPayment.status,
      paymentStatus,
      published,
      tribute,
      publicUrl: tribute?.slug ? `/presente/${tribute.slug}` : null,
    });
  } catch (error) {
    console.error("Erro em GET /api/payments/status:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao consultar pagamento." },
      { status: 500 }
    );
  }
}
