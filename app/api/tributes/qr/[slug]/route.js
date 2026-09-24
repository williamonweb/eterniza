import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { publishedPage, publicPageUrl } from '../../../../../lib/normal/publicQr';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const page = await publishedPage(params.slug);
  if (!page) return NextResponse.json({ ok: false, message: 'Página não publicada.' }, { status: 404 });
  const png = await QRCode.toBuffer(publicPageUrl(req, page.slug), { type: 'png', width: 640, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#30271eff', light: '#ffffffff' } });
  return new NextResponse(png, { headers: { 'Content-Type': 'image/png', 'Content-Disposition': `inline; filename="eterniza-qr.png"`, 'Cache-Control': 'public, max-age=3600' } });
}
