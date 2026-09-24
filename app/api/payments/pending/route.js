import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';
import { hasGuestAccess } from '../../../../lib/normal/guestAccess';
import { getAsaasPayment, getAsaasPixQrCode } from '../../../../lib/asaas';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get('tributeId');
    if (!id) return NextResponse.json({ ok: false, message: 'Página não informada.' }, { status: 400 });
    const [user, tribute] = await Promise.all([
      getCurrentUser(),
      prisma.tribute.findUnique({ where: { id }, include: { user: { select: { email: true } } } }),
    ]);
    if (!tribute || (tribute.userId !== user?.id && !hasGuestAccess(tribute))) {
      return NextResponse.json({ ok: false, message: 'Página não encontrada.' }, { status: 404 });
    }
    if (tribute.status === 'PUBLISHED') return NextResponse.json({ ok: true, published: true, slug: tribute.slug });
    const payment = await prisma.payment.findFirst({ where: { tributeId: id, status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
    if (!payment?.mercadoPagoId) return NextResponse.json({ ok: true, payment: null });
    const asaas = await getAsaasPayment(payment.mercadoPagoId);
    if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(asaas.status)) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'APPROVED' } });
      await prisma.tribute.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: tribute.publishedAt || new Date() } });
      return NextResponse.json({ ok: true, published: true, slug: tribute.slug });
    }
    if (asaas.status !== 'PENDING') return NextResponse.json({ ok: true, payment: null });
    const qr = await getAsaasPixQrCode(payment.mercadoPagoId);
    return NextResponse.json({ ok: true, payment: {
      asaasId: payment.mercadoPagoId,
      qrCode: qr.payload || qr.pixCopiaECola || null,
      qrCodeBase64: qr.encodedImage || qr.qrCodeBase64 || null,
    } });
  } catch (error) {
    console.error('Erro em GET /api/payments/pending:', error);
    return NextResponse.json({ ok: false, message: 'Não foi possível verificar o PIX anterior.' }, { status: 500 });
  }
}
