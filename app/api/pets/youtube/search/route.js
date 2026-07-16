import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";

const FALLBACK_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyBVAOAwPM_3Z2CRaWlVONFxBiY6YBTDXZk";

const demoCatalog = [
  { id:"nSDgHBxUbVQ", title:"Photograph", channel:"Ed Sheeran", keywords:"photograph foto lembrança emocionante" },
  { id:"rtOvBOTyX00", title:"A Thousand Years", channel:"Christina Perri", keywords:"a thousand years piano amor emocionante" },
  { id:"YQHsXMglC9A", title:"Hello", channel:"Adele", keywords:"hello adele emocional despedida" },
  { id:"kPa7bsKwL-c", title:"Until I Found You", channel:"Stephen Sanchez", keywords:"until i found you amor acústico" },
  { id:"2Vv-BfVoq4g", title:"Perfect", channel:"Ed Sheeran", keywords:"perfect romance piano" },
];

async function requireClinicUser() {
  const current = await getCurrentUser();
  if (!current) return null;
  const user = await prisma.user.findUnique({
    where: { id: current.id },
    include: { clinic: true },
  });
  if (
    !user ||
    !["CLINIC_MANAGER", "CLINIC_STAFF"].includes(String(user.role)) ||
    user.clinic?.status !== "APPROVED"
  ) return null;
  return user;
}

export async function GET(request) {
  const user = await requireClinicUser();
  if (!user) {
    return NextResponse.json({ ok:false, message:"Acesso não autorizado." }, { status:403 });
  }

  const query = String(new URL(request.url).searchParams.get("q") || "").trim();
  if (query.length < 2) {
    return NextResponse.json({ ok:false, message:"Digite pelo menos 2 caracteres." }, { status:400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY || FALLBACK_API_KEY;

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      safeSearch: "strict",
      maxResults: "8",
      q: query,
      key: apiKey,
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data?.error?.message || "Busca indisponível.");

    const results = (data.items || []).map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title || "Vídeo",
      channel: item.snippet?.channelTitle || "",
      thumb: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    })).filter((item) => item.id);

    return NextResponse.json({ ok:true, results });
  } catch (error) {
    const normalized = query.toLowerCase();
    const results = demoCatalog
      .filter((item) => `${item.title} ${item.channel} ${item.keywords}`.toLowerCase().includes(normalized))
      .map((item) => ({
        ...item,
        thumb: `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      }));

    return NextResponse.json({
      ok:true,
      fallback:true,
      results,
      message: results.length ? "Resultados demonstrativos." : "Nenhum resultado encontrado.",
    });
  }
}
