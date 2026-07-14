import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { getPlanBySlug } from "../../../../lib/asaas";


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

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const code = normalizeCouponCode(body.code);
    const planSlug = String(body.plan || "").trim().toLowerCase();

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Informe um cupom." },
        { status: 400 }
      );
    }

    if (!planSlug) {
      return NextResponse.json(
        { ok: false, message: "Plano não informado." },
        { status: 400 }
      );
    }

    const [coupon, plan] = await Promise.all([
      prisma.coupon.findUnique({ where: { code } }),
      getPlanBySlug(planSlug),
    ]);

    if (!coupon || !couponWindowIsValid(coupon)) {
      return NextResponse.json(
        { ok: false, message: "Cupom inválido, inativo ou expirado." },
        { status: 400 }
      );
    }

    if (
      coupon.appliesToPlan &&
      coupon.appliesToPlan !== "*" &&
      coupon.appliesToPlan.toLowerCase() !== planSlug
    ) {
      return NextResponse.json(
        { ok: false, message: "Este cupom não é válido para o plano escolhido." },
        { status: 400 }
      );
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { ok: false, message: "Este cupom atingiu o limite de utilizações." },
        { status: 400 }
      );
    }

    if (coupon.oncePerUser) {
      const alreadyUsed = await prisma.payment.findFirst({
        where: {
          couponId: coupon.id,
          tribute: { userId: user.id },
          status: { in: ["PENDING", "APPROVED", "RECEIVED", "CONFIRMED"] },
        },
        select: { id: true },
      });

      if (alreadyUsed) {
        return NextResponse.json(
          { ok: false, message: "Este cupom já foi utilizado por você." },
          { status: 400 }
        );
      }
    }

    const values = calculateCouponDiscount(coupon, plan.priceCents);

    return NextResponse.json({
      ok: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        ...values,
      },
      plan: {
        slug: plan.slug,
        name: plan.name,
        priceCents: plan.priceCents,
      },
    });
  } catch (error) {
    console.error("Erro em POST /api/coupons/validate:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao validar cupom." },
      { status: 500 }
    );
  }
}
