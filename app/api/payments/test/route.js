import { NextResponse } from "next/server";
import { createPixPayment, getPlanBySlug } from "../../../../lib/mercadopago";

export async function GET() {
  try {
    const plan = getPlanBySlug("premium");

    const mpPayment = await createPixPayment({
      tributeId: "teste-eterniza",
      payerEmail: "teste@email.com",
      payerName: "Teste Eterniza",
      plan,
    });

    const qrData = mpPayment?.point_of_interaction?.transaction_data;

    return NextResponse.json({
      ok: true,
      mercadoPagoId: mpPayment.id,
      status: mpPayment.status,
      qrCode: qrData?.qr_code || null,
      qrCodeBase64: qrData?.qr_code_base64 || null,
      ticketUrl: qrData?.ticket_url || null,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}