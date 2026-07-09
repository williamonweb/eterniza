import { NextResponse } from "next/server";
import { getPlans } from "../../../lib/asaas";

export async function GET() {
  try {
    const plans = await getPlans();
    return NextResponse.json({ ok: true, plans });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao carregar planos.", plans: [] },
      { status: 500 }
    );
  }
}
