import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getAsaasPayment } from "../../../../lib/asaas";

function normalizeAsaasStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(normalized)) {
    return "APPROVED";
  }
  if (["REFUNDED"].includes(normalized)) return "REFUNDED";
  if (["OVERDUE", "DELETED", "CANCELLED"].includes(normalized)) return "CANCELLED";
  return "PENDING";
}

function isApprovedStatus(status) {
  return normalizeAsaasStatus(status) === "APPROVED";
}

export async function GET(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const tributeId = String(url.searchParams.get("tributeId") || "");
    const paymentId = String(url.searchParams.get("paymentId") || "");

    if (!tributeId && !paymentId) {
      return NextResponse.json(
        { ok: false, message: "Informe a homenagem ou a cobrança." },
        { status: 400 }
      );
    }

    const tribute = tributeId
      ? await prisma.tribute.findFirst({
          where: {
            id: tributeId,
            userId: user.id,
          },
        })
      : null;

    if (tributeId && !tribute) {
      return NextResponse.json(
        { ok: false, message: "Homenagem não encontrada." },
        { status: 404 }
      );
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        ...(paymentId ? { mercadoPagoId: paymentId } : {}),
        ...(tributeId ? { tributeId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const asaasId = paymentId || existingPayment?.mercadoPagoId;

    if (!asaasId) {
      return NextResponse.json({
        ok: true,
        provider: "asaas",
        paymentStatus: existingPayment?.status || "PENDING",
        tributeStatus: tribute?.status || null,
        published: String(tribute?.status || "").toUpperCase() === "PUBLISHED",
        slug: tribute?.slug || null,
        publicUrl: tribute?.publicUrl || null,
      });
    }

    const asaasPayment = await getAsaasPayment(asaasId);
    const asaasStatus = String(asaasPayment.status || "").toUpperCase();
    const paymentStatus = normalizeAsaasStatus(asaasStatus);
    const resolvedTributeId = String(asaasPayment.externalReference || tributeId || existingPayment?.tributeId || "");

    let updatedPayment = existingPayment;

    if (existingPayment) {
      updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: paymentStatus },
      });
    } else if (resolvedTributeId) {
      updatedPayment = await prisma.payment.create({
        data: {
          tributeId: resolvedTributeId,
          mercadoPagoId: asaasId,
          status: paymentStatus,
          amount: Number(asaasPayment.value || 0),
        },
      });
    }

    let updatedTribute = tribute;

    if (isApprovedStatus(asaasStatus) && resolvedTributeId) {
      updatedTribute = await prisma.tribute.update({
        where: { id: resolvedTributeId },
        data: { status: "PUBLISHED" },
      });
    } else if (!updatedTribute && resolvedTributeId) {
      updatedTribute = await prisma.tribute.findFirst({
        where: {
          id: resolvedTributeId,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      asaasId,
      asaasStatus,
      paymentStatus,
      paymentId: updatedPayment?.id || null,
      tributeId: updatedTribute?.id || resolvedTributeId || null,
      tributeStatus: updatedTribute?.status || null,
      published: String(updatedTribute?.status || "").toUpperCase() === "PUBLISHED" || paymentStatus === "APPROVED",
      slug: updatedTribute?.slug || null,
      publicUrl: updatedTribute?.publicUrl || null,
    });
  } catch (error) {
    console.error("Erro em GET /api/payments/status (Asaas):", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao consultar status do pagamento." },
      { status: 500 }
    );
  }
}
