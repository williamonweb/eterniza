import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    accessTokenPrefix: process.env.MP_ACCESS_TOKEN?.substring(0, 12) || null,
    publicKeyPrefix: process.env.MP_PUBLIC_KEY?.substring(0, 12) || null,
  });
}