import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';
import { hasAdminPermission } from '../../../../lib/adminPermissions';

export const dynamic = 'force-dynamic';
const KEY = 'homePopupImageAsset';
const MAX_BYTES = 2 * 1024 * 1024;

function imageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return 'image/png';
  if (Buffer.from(bytes.subarray(0,4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8,12)).toString() === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok:false, message:'Não autenticado.' }, { status:401 });
    if (!hasAdminPermission(user, 'settings')) return NextResponse.json({ ok:false, message:'Acesso negado.' }, { status:403 });
    const form = await request.formData();
    const file = form.get('image');
    if (!file || typeof file.arrayBuffer !== 'function' || !file.size || file.size > MAX_BYTES) {
      return NextResponse.json({ ok:false, message:'Escolha uma imagem JPG, PNG ou WebP de até 2 MB.' }, { status:400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = imageType(bytes);
    if (!mime) return NextResponse.json({ ok:false, message:'Formato inválido. Use JPG, PNG ou WebP.' }, { status:400 });
    await prisma.systemSetting.upsert({
      where: { key:KEY }, update: { value:{ mime, data:bytes.toString('base64') } },
      create: { key:KEY, group:'landing', value:{ mime, data:bytes.toString('base64') } },
    });
    return NextResponse.json({ ok:true, url:'/api/home/popup-image?v=' + Date.now() });
  } catch (error) {
    console.error('Erro ao enviar imagem do aviso:', error);
    return NextResponse.json({ ok:false, message:'Não foi possível enviar a imagem.' }, { status:500 });
  }
}

export async function GET() {
  try {
    const row = await prisma.systemSetting.findUnique({ where:{ key:KEY } });
    const value = row?.value;
    if (!value?.data || !['image/jpeg','image/png','image/webp'].includes(value.mime)) return new Response(null, { status:404 });
    const bytes = Buffer.from(value.data, 'base64');
    if (bytes.length > MAX_BYTES || imageType(bytes) !== value.mime) return new Response(null, { status:404 });
    return new Response(bytes, { headers:{ 'Content-Type':value.mime, 'Cache-Control':'public, max-age=300', 'X-Content-Type-Options':'nosniff' } });
  } catch (error) {
    console.error('Erro ao carregar imagem do aviso:', error);
    return new Response(null, { status:500 });
  }
}
