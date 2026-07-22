import { NextResponse } from "next/server";
import { getPlans } from "../../../lib/asaas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await getPlans();

    return NextResponse.json(
      { ok: true, plans },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Erro em GET /api/plans:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Erro ao carregar planos.", plans: [] },
      { status: 500 }
    );
  }
}
