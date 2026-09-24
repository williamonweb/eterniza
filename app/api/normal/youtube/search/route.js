import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Entre na sua conta para buscar músicas.' }, { status: 401 });
  const q = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (q.length < 2 || q.length > 100) return NextResponse.json({ ok: false, message: 'Digite o nome da música ou do artista.' }, { status: 400 });
  const key = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ ok: false, message: 'Busca de músicas indisponível. Configure YOUTUBE_API_KEY no servidor.' }, { status: 503 });
  try {
    const params = new URLSearchParams({ part: 'snippet', type: 'video', videoEmbeddable: 'true', maxResults: '8', safeSearch: 'strict', q, key });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ ok: false, message: 'Não foi possível buscar músicas agora. Tente novamente.' }, { status: 502 });
    const data = await response.json();
    const results = (data.items || []).filter(item => /^[A-Za-z0-9_-]{11}$/.test(item.id?.videoId || '')).map(item => ({
      id: item.id.videoId,
      title: item.snippet?.title || 'Música',
      channel: item.snippet?.channelTitle || '',
      thumb: `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false, message: 'Não foi possível buscar músicas agora. Tente novamente.' }, { status: 502 });
  }
}
