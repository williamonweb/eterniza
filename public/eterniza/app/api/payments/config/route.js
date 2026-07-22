import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    publicKey: process.env.MP_PUBLIC_KEY || "",
  });
}
