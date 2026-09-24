import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const lifetime = 60 * 60 * 24 * 30;
const cookieName = id => `eterniza_guest_${id}`;

function signature(id, userId, expires) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 24) throw new Error('AUTH_SECRET precisa estar configurado.');
  return createHmac('sha256', secret).update(`${id}:${userId}:${expires}`).digest('hex');
}

export function grantGuestAccess(response, tribute) {
  const expires = Math.floor(Date.now() / 1000) + lifetime;
  response.cookies.set(cookieName(tribute.id), `${expires}.${signature(tribute.id, tribute.userId, expires)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: lifetime,
  });
  return response;
}

export function hasGuestAccess(tribute) {
  if (!tribute || !tribute.user?.email?.endsWith('@guest.eternizas.invalid')) return false;
  const token = cookies().get(cookieName(tribute.id))?.value || '';
  const [expiresText, provided] = token.split('.');
  const expires = Number(expiresText);
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000) || !/^[a-f0-9]{64}$/.test(provided || '')) return false;
  const expected = signature(tribute.id, tribute.userId, expires);
  return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
}
