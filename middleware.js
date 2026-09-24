import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth/session';
const protectedRoutes = ['/dashboard','/admin','/minhas-paginas','/minha-conta'];
export async function middleware(req){
  const {pathname}=req.nextUrl;
  if(!protectedRoutes.some(route=>pathname===route||pathname.startsWith(route+'/')))return NextResponse.next();
  const token=req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session=await verifySessionToken(token);
  if(!session){const loginUrl=new URL('/login',req.url);loginUrl.searchParams.set('redirect',pathname+req.nextUrl.search);return NextResponse.redirect(loginUrl);}
  if(pathname.startsWith('/admin')&&session.role!=='ADMIN')return NextResponse.redirect(new URL('/minhas-paginas',req.url));
  return NextResponse.next();
}
export const config={matcher:['/dashboard/:path*','/admin/:path*','/minhas-paginas/:path*','/minha-conta/:path*']};
