import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { createAsaasPixPayment, getPlanBySlug, getAsaasPayment, getAsaasPixQrCode } from "../../../../lib/asaas";
import { hasGuestAccess } from "../../../../lib/normal/guestAccess";

export const dynamic = "force-dynamic";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;

  return digit === Number(cpf[10]);
}


function normalizeCouponCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function couponWindowIsValid(coupon, now = new Date()) {
  if (!coupon?.isActive) return false;

  if (coupon.startsAt) {
    const startsAt = new Date(coupon.startsAt);
    if (!Number.isNaN(startsAt.getTime()) && now < startsAt) return false;
  }

  if (coupon.endsAt) {
    const endsAt = new Date(coupon.endsAt);
    if (!Number.isNaN(endsAt.getTime())) {
      endsAt.setHours(23, 59, 59, 999);
      if (now > endsAt) return false;
    }
  }

  return true;
}

function calculateCouponDiscount(coupon, priceCents) {
  const original = Math.max(0, Number(priceCents || 0));
  let discount = 0;

  if (coupon.discountType === "PERCENT") {
    const percent = Math.min(100, Math.max(0, Number(coupon.discountValue || 0)));
    discount = Math.round(original * (percent / 100));
  } else {
    discount = Math.max(0, Number(coupon.discountValue || 0));
  }

  discount = Math.min(original, discount);
  return {
    originalPriceCents: original,
    discountCents: discount,
    finalPriceCents: Math.max(100, original - discount),
  };
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    const body = await req.json().catch(() => ({}));
    const tributeId = String(body.tributeId || "");
    const requestedPlanSlug = String(body.plan || "").trim().toLowerCase();
    const cpfFromBody = onlyDigits(body.cpfCnpj || body.cpf || "");
    const payerEmail = String(body.email || "").trim().toLowerCase();
    const payerName = String(body.name || "").trim().slice(0, 120);
    const couponCode = normalizeCouponCode(body.couponCode || body.coupon || "");

    if (!tributeId) {
      return NextResponse.json({ ok: false, message: "Homenagem não informada." }, { status: 400 });
    }

    const tribute = await prisma.tribute.findUnique({ where: { id: tributeId }, include: { user: { select: { email: true } } } });
    if (!tribute || (tribute.userId !== user?.id && !hasGuestAccess(tribute))) {
      return NextResponse.json({ ok: false, message: "Página não encontrada neste navegador." }, { status: 404 });
    }
    const guest = tribute.user.email.endsWith('@guest.eternizas.invalid');
    if (guest && (!payerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail))) {
      return NextResponse.json({ ok: false, message: "Informe seu nome e e-mail para gerar o PIX." }, { status: 400 });
    }
    const dbUser = guest ? { id: tribute.userId, name: payerName, email: payerEmail, cpf: null } : await prisma.user.findUnique({
      where: { id: tribute.userId }, select: { id: true, name: true, email: true, cpf: true },
    });

    if (!dbUser) {
      return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });
    }

    const cpfCnpj = onlyDigits(dbUser.cpf || "") || cpfFromBody;

    if (!isValidCpf(cpfCnpj)) {
      return NextResponse.json(
        {
          ok: false,
          code: "CPF_REQUIRED",
          message: "Informe um CPF válido para gerar o PIX.",
        },
        { status: 400 }
      );
    }

    if (!guest && cpfCnpj && cpfCnpj !== onlyDigits(dbUser.cpf || "")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { cpf: cpfCnpj },
      });
    }

    const tributeContent = tribute.content && typeof tribute.content === "object"
      ? tribute.content
      : {};
    const savedPlanSlug = String(
      tribute.planId ||
      tributeContent?.plan?.slug ||
      tributeContent?.plan?.id ||
      ""
    ).trim().toLowerCase();

    const planSlug = savedPlanSlug || requestedPlanSlug;

    if (!planSlug) {
      return NextResponse.json(
        { ok: false, message: "Plano da homenagem não encontrado." },
        { status: 400 }
      );
    }

    const plan = await getPlanBySlug(planSlug);
    const tributePhotos = Array.isArray(tributeContent.photos)
      ? tributeContent.photos.filter(Boolean)
      : [];
    const photoLimit = Number(plan.photos || 0);

    if (!photoLimit || tributePhotos.length > photoLimit) {
      return NextResponse.json(
        {
          ok: false,
          code: 'PHOTO_LIMIT_EXCEEDED',
          message: `O plano ${plan.name} permite até ${photoLimit} fotos. Remova as fotos excedentes antes de gerar o PIX.`,
        },
        { status: 400 }
      );
    }

    if (tribute.status === 'PUBLISHED') {
      return NextResponse.json({ ok: false, message: 'Esta página já foi publicada.' }, { status: 409 });
    }
    const existingPending = await prisma.payment.findFirst({ where: { tributeId: tribute.id, status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
    if (existingPending?.mercadoPagoId) {
      const charge = await getAsaasPayment(existingPending.mercadoPagoId);
      if (charge.status === 'PENDING') {
        const qr = await getAsaasPixQrCode(existingPending.mercadoPagoId);
        return NextResponse.json({ ok: true, provider: 'asaas', payment: {
          asaasId: existingPending.mercadoPagoId,
          qrCode: qr.payload || qr.pixCopiaECola || null,
          qrCodeBase64: qr.encodedImage || qr.qrCodeBase64 || null,
        } });
      }
      if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(charge.status)) {
        return NextResponse.json({ ok: false, message: 'O PIX já foi pago. Reabra esta página para ver o resultado.' }, { status: 409 });
      }
    }

    let coupon = null;
    let pricing = {
      originalPriceCents: Number(plan.priceCents || 0),
      discountCents: 0,
      finalPriceCents: Number(plan.priceCents || 0),
    };

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !couponWindowIsValid(coupon)) {
        return NextResponse.json(
          { ok: false, code: "COUPON_INVALID", message: "Cupom inválido, inativo ou expirado." },
          { status: 400 }
        );
      }

      if (
        coupon.appliesToPlan &&
        coupon.appliesToPlan !== "*" &&
        coupon.appliesToPlan.toLowerCase() !== planSlug
      ) {
        return NextResponse.json(
          { ok: false, code: "COUPON_PLAN_INVALID", message: "Este cupom não é válido para o plano escolhido." },
          { status: 400 }
        );
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { ok: false, code: "COUPON_LIMIT", message: "Este cupom atingiu o limite de utilizações." },
          { status: 400 }
        );
      }

      if (coupon.oncePerUser) {
        const alreadyUsed = await prisma.payment.findFirst({
          where: {
            couponId: coupon.id,
            tribute: { userId: tribute.userId },
            status: { in: ["PENDING", "APPROVED", "RECEIVED", "CONFIRMED"] },
          },
          select: { id: true },
        });

        if (alreadyUsed) {
          return NextResponse.json(
            { ok: false, code: "COUPON_ALREADY_USED", message: "Este cupom já foi utilizado por você." },
            { status: 400 }
          );
        }
      }

      pricing = calculateCouponDiscount(coupon, plan.priceCents);
    }

    const chargePlan = {
      ...plan,
      priceCents: pricing.finalPriceCents,
      cents: pricing.finalPriceCents,
      price: pricing.finalPriceCents / 100,
    };

    if (guest) {
      await prisma.user.update({ where: { id: tribute.userId }, data: { name: payerName, notes: payerEmail } });
    }

    const asaasResult = await createAsaasPixPayment({
      tributeId: tribute.id,
      payerEmail: dbUser.email,
      payerName: dbUser.name,
      payerCpfCnpj: cpfCnpj,
      plan: chargePlan,
    });

    const payment = await prisma.$transaction(async (tx) => {
      if (coupon) {
        const updated = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            ...(coupon.maxUses !== null
              ? { usedCount: { lt: coupon.maxUses } }
              : {}),
          },
          data: {
            usedCount: { increment: 1 },
          },
        });

        if (updated.count !== 1) {
          throw new Error("O cupom ficou indisponível antes da conclusão do pagamento.");
        }
      }

      return tx.payment.create({
        data: {
          tributeId: tribute.id,
          amount: pricing.finalPriceCents / 100,
          originalAmount: pricing.originalPriceCents / 100,
          discountAmount: pricing.discountCents / 100,
          couponCode: coupon?.code || null,
          couponId: coupon?.id || null,
          status: "PENDING",
          mercadoPagoId: String(asaasResult.payment.id),
        },
      });
    });

    return NextResponse.json({
      ok: true,
      provider: "asaas",
      payment: {
        id: payment.id,
        mercadoPagoId: asaasResult.payment.id,
        asaasId: asaasResult.payment.id,
        status: asaasResult.payment.status,
        plan: {
          ...plan,
          price: pricing.finalPriceCents / 100,
          priceCents: pricing.finalPriceCents,
          cents: pricing.finalPriceCents,
        },
        coupon: coupon
          ? {
              code: coupon.code,
              name: coupon.name,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              originalPriceCents: pricing.originalPriceCents,
              discountCents: pricing.discountCents,
              finalPriceCents: pricing.finalPriceCents,
            }
          : null,
        qrCode:
          asaasResult.qrCode?.payload ||
          asaasResult.qrCode?.pixCopiaECola ||
          null,
        qrCodeBase64:
          asaasResult.qrCode?.encodedImage ||
          asaasResult.qrCode?.qrCodeBase64 ||
          null,
        ticketUrl:
          asaasResult.payment?.invoiceUrl ||
          asaasResult.payment?.bankSlipUrl ||
          null,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/payments/create:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao criar pagamento." },
      { status: 500 }
    );
  }
}
