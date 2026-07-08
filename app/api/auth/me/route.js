import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || "Erro ao buscar usuário." }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
