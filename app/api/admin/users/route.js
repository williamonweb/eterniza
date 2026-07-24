import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { hasAdminPermission } from "../../../../lib/adminPermissions";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Não autenticado." },
        { status: 401 }
      );
    }

    if (!hasAdminPermission(currentUser, "clients")) {
      return NextResponse.json(
        { ok: false, message: "Acesso negado." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tributes: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        totalTributes: user._count.tributes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Erro em GET /api/admin/users:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Erro ao buscar clientes.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
