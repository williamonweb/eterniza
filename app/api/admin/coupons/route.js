import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { hasAdminPermission } from "../../../../lib/adminPermissions";

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      ),
    };
  }

  if (!hasAdminPermission(user, "coupons")) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Acesso negado." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const coupons = await prisma.coupon.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ ok: true, coupons });
  } catch (error) {
    console.error("Erro em GET /api/admin/coupons:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao buscar cupons." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);

    if (!code || code.length < 3) {
      return NextResponse.json(
        { ok: false, message: "Informe um código com pelo menos 3 caracteres." },
        { status: 400 }
      );
    }

    const discountType =
      String(body.discountType || "PERCENT").toUpperCase() === "FIXED"
        ? "FIXED"
        : "PERCENT";

    const discountValue =
      discountType === "FIXED"
        ? Math.round(Number(body.discountValue || 0) * 100)
        : Math.round(Number(body.discountValue || 0));

    if (discountValue <= 0) {
      return NextResponse.json(
        { ok: false, message: "Informe um desconto válido." },
        { status: 400 }
      );
    }

    if (discountType === "PERCENT" && discountValue > 100) {
      return NextResponse.json(
        { ok: false, message: "O desconto percentual não pode passar de 100%." },
        { status: 400 }
      );
    }

    const id = String(body.id || "").trim();

    const data = {
      code,
      name: String(body.name || "").trim() || null,
      description: String(body.description || "").trim() || null,
      discountType,
      discountValue,
      appliesToPlan:
        String(body.appliesToPlan || "*").trim().toLowerCase() || "*",
      startsAt: parseDate(body.startsAt),
      endsAt: parseDate(body.endsAt),
      maxUses:
        body.maxUses === "" || body.maxUses === null || body.maxUses === undefined
          ? null
          : Math.max(1, Number(body.maxUses)),
      oncePerUser: Boolean(body.oncePerUser),
      isActive: body.isActive !== false,
    };

    const coupon = id
      ? await prisma.coupon.update({ where: { id }, data })
      : await prisma.coupon.create({ data });

    return NextResponse.json({
      ok: true,
      message: id ? "Cupom atualizado com sucesso." : "Cupom criado com sucesso.",
      coupon,
    });
  } catch (error) {
    console.error("Erro em POST /api/admin/coupons:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { ok: false, message: "Já existe um cupom com este código." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao salvar cupom." },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "Cupom não informado." },
        { status: 400 }
      );
    }

    const paymentCount = await prisma.payment.count({
      where: { couponId: id },
    });

    if (paymentCount > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        ok: true,
        message: "Cupom desativado porque já possui pagamentos vinculados.",
      });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({
      ok: true,
      message: "Cupom excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro em DELETE /api/admin/coupons:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao excluir cupom." },
      { status: 500 }
    );
  }
}
