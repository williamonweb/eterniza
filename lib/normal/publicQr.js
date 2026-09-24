import { prisma } from '../prisma';

export async function publishedPage(slug) {
  const tribute = await prisma.tribute.findUnique({ where: { slug }, select: { slug: true, title: true, status: true, content: true } });
  return tribute?.status === 'PUBLISHED' && tribute.content?.builderVersion === '2.0' ? tribute : null;
}

export function publicPageUrl(req, slug) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const origin = configured ? new URL(configured).origin : new URL(req.url).origin;
  return `${origin}/p/${encodeURIComponent(slug)}`;
}
