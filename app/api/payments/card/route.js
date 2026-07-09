import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Pagamento com cartão desativado temporariamente. Use PIX.",
    },
    { status: 410 }
  );
}
