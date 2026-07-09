import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      provider: "asaas",
      message: "Pagamento com cartão será ativado depois. No momento, use PIX pelo Asaas.",
    },
    { status: 410 }
  );
}
