import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { publishedPage, publicPageUrl } from '../../../../../lib/normal/publicQr';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const tribute = await publishedPage(params.slug);
  if (!tribute) return NextResponse.json({ ok: false, message: 'A página ainda não foi publicada.' }, { status: 404 });

  const url = publicPageUrl(req, tribute.slug);
  const pdf = await PDFDocument.create();
  const sheet = pdf.addPage([595.28, 841.89]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const ink = rgb(.18, .15, .12), gold = rgb(.61, .45, .27), muted = rgb(.42, .38, .33);
  const center = (text, y, size, font, color) => sheet.drawText(text, { x: (595.28 - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
  sheet.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(.996, .982, .959) });
  sheet.drawRectangle({ x: 31, y: 31, width: 533.28, height: 779.89, borderColor: rgb(.83, .72, .55), borderWidth: 1.2 });
  sheet.drawRectangle({ x: 43, y: 43, width: 509.28, height: 755.89, borderColor: rgb(.91, .85, .76), borderWidth: .5 });
  center('Eterniza', 748, 43, serifBold, ink);
  center('PESSOAS  •  HISTÓRIAS  •  MOMENTOS', 722, 10, sans, gold);
  sheet.drawLine({ start: { x: 191, y: 704 }, end: { x: 404, y: 704 }, thickness: .8, color: gold });
  center('Uma história especial para você', 667, 24, serif, ink);
  const rawTitle = Array.from(String(tribute.title || 'Nossa história').replace(/[\r\n\t]/g, ' ').trim()).filter(char => { try { serifBold.encodeText(char); return true; } catch { return false; } }).join('');
  const title = rawTitle.length > 42 ? `${rawTitle.slice(0, 39)}...` : rawTitle;
  center(title, 633, Math.min(26, 490 / Math.max(1, serifBold.widthOfTextAtSize(title, 1))), serifBold, gold);

  const cover = tribute.content?.photos?.[0];
  if (typeof cover === 'string' && cover.startsWith('data:image/jpeg;base64,') && cover.length < 3_000_000) {
    try {
      const photo = await pdf.embedJpg(Buffer.from(cover.split(',')[1], 'base64'));
      const dims = photo.scaleToFit(416, 151);
      sheet.drawImage(photo, { x: (595.28 - dims.width) / 2, y: 452 + (151 - dims.height) / 2, width: dims.width, height: dims.height });
    } catch { /* O QR e o link continuam disponíveis mesmo sem a foto. */ }
  }
  const qr = await pdf.embedPng(await QRCode.toBuffer(url, { type: 'png', width: 640, margin: 2, errorCorrectionLevel: 'H' }));
  sheet.drawRectangle({ x: 189, y: 212, width: 217, height: 217, color: rgb(1, 1, 1), borderColor: rgb(.85, .76, .62), borderWidth: 1 });
  sheet.drawImage(qr, { x: 198, y: 221, width: 199, height: 199 });
  center('Aponte a câmera do celular para abrir a página', 179, 14, serif, ink);
  const shownUrl = url.length > 74 ? `${url.slice(0, 71)}...` : url;
  center(shownUrl, 153, 10, sans, muted);
  sheet.drawLine({ start: { x: 154, y: 126 }, end: { x: 441, y: 126 }, thickness: .7, color: gold });
  center('Crie também uma página para guardar sua história.', 100, 13, serif, ink);
  center('eternizas.com.br', 74, 12, sans, gold);

  const bytes = await pdf.save();
  return new NextResponse(bytes, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="eterniza-${tribute.slug}.pdf"`, 'Cache-Control': 'public, max-age=3600' } });
}
