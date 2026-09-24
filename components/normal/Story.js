'use client';
import { useEffect, useState } from 'react';
import { categoryFor } from '../../lib/normal/categories';
import './story.css';

export function youtubeId(value) {
  const raw = String(value || '').trim();
  try {
    const url = new URL(raw);
    if (!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be'].includes(url.hostname)) return '';
    const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : url.searchParams.get('v');
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : '';
  } catch { return ''; }
}
function dateAtNoon(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const [year,month,day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
export function dateStats(value, now = new Date()) {
  const date = dateAtNoon(value);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const days = Math.round((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) - Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())) / 86400000);
  if (days < 0) return { future: true, days: -days, years: 0, next: null, until: -days };
  let years = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) years--;
  let next = new Date(today.getFullYear(), date.getMonth(), date.getDate(), 12);
  if (next < today) next = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate(), 12);
  const until = Math.round((Date.UTC(next.getFullYear(),next.getMonth(),next.getDate()) - Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())) / 86400000);
  return { days, years, until, next, future:false };
}
const openings = {
  namoro:['Algumas histórias começam com um encontro.','E se tornam o nosso lugar favorito.'],
  casamento:['Duas vidas, uma escolha.','E um amor para celebrar todos os dias.'],
  aniversario:['Hoje é dia de celebrar você.','E tudo de bonito que ainda virá.'],
  bebe:['Uma vida pequena.','Um amor maior do que o mundo.'],
  familia:['As melhores histórias nascem em casa.','E vivem em cada abraço.'],
  pet:['Quatro patas, infinitas lembranças.','Um amor que faz parte da família.'],
  datas:['Há dias que merecem ficar para sempre.','Este é um deles.'],
  homenagem:['Algumas presenças nunca nos deixam.','Elas vivem em nossas memórias.'],
};
export default function Story({ content = {}, preview = false }) {
  const [now,setNow] = useState(null);
  const [open,setOpen] = useState(false);
  const [count,setCount] = useState(3);
  useEffect(() => { setNow(new Date()); const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer); }, []);
  const category = categoryFor(content.recipient?.id || content.category);
  const photos = Array.isArray(content.photos) ? content.photos : [];
  const stats = now && dateStats(content.specialDate, now);
  const memorial = category.id === 'homenagem';
  const video = youtubeId(content.youtubeLink);
  const first = photos[0] || category.image;
  const title = content.title?.trim() || content.receiverName?.trim() || 'Nossa história';
  useEffect(() => {if(open || count===0)return; const timer=setTimeout(()=>setCount(value=>value-1),1000);return()=>clearTimeout(timer);},[open,count]);
  const phrases=openings[category.id] || openings.datas;
  return <article className={`story story-${category.id}`} style={{'--story-accent':category.accent}}>
    {preview && <div className="story-preview-label">Pré-visualização · só você pode ver por enquanto</div>}
    {!open&&<div className="story-intro" aria-label="Uma carta especial para você">
      <div className="story-intro-stars" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</div>
      <span className="story-intro-kicker">Eterniza apresenta</span>
      <h2>{phrases[0]}</h2><p className="story-intro-phrase">{phrases[1]}</p>
      <div className="story-envelope" aria-hidden="true"><div className="story-envelope-flap"/><div className="story-envelope-face"/><div className="story-seal">E<span>✦</span></div></div>
      <p className="story-intro-recipient">{content.receiverName ? `Para ${content.receiverName}` : 'Uma lembrança feita com carinho'}</p>
      <div className="story-intro-bottom"><span className="story-intro-count" aria-live="polite">{count>0?`Sua surpresa começa em ${count}…`:'Sua carta está pronta ♡'}</span>{count===0&&<button type="button" className="story-open-button" onClick={()=>setOpen(true)}>Abrir a carta <span aria-hidden="true">↗</span></button>}</div>
    </div>}
    <div className={open?'story-reveal is-open':'story-reveal'} hidden={!open}>
    <div className="story-hero" style={{backgroundImage:`linear-gradient(0deg,rgba(25,19,16,.75),transparent 70%),url("${String(first).replace(/["\\]/g,'')}")`}}>
      <div><span className="story-eyebrow">❧ Eterniza · {category.label}</span><h1>{title}</h1><p>{content.subtitle || 'Uma história para guardar para sempre.'}</p></div>
    </div>
    <div className="story-body"><span className="story-ornament">✦</span><h2>{memorial ? 'Uma história que vive em nós' : 'Cada momento merece ser lembrado'}</h2>
      {content.message && <p className="story-message">{content.message}</p>}
      {stats && <div className="story-date"><span>{memorial ? 'Para sempre em nossos corações' : stats.future ? 'Contando os dias' : category.id === 'bebe' || category.id === 'aniversario' ? 'Celebrando a vida' : 'Nossa história em números'}</span><strong>{stats.future ? `${stats.days} dias para esse momento` : memorial ? `${stats.days.toLocaleString('pt-BR')} dias de memórias` : `${stats.days.toLocaleString('pt-BR')} dias de história`}</strong>{!stats.future && !memorial && <small>{stats.years} {stats.years === 1 ? 'ano' : 'anos'} · {stats.until === 0 ? 'Hoje é o dia! ♥' : `Próximo aniversário em ${stats.until} ${stats.until === 1 ? 'dia' : 'dias'}`}</small>}</div>}
      {photos.length > 0 && <section className="story-gallery" aria-label="Fotos desta história">{photos.map((photo,i)=><img key={i} src={photo} alt={`Lembrança ${i+1}`} loading="lazy" />)}</section>}
      {video && <section className="story-music"><span className="story-section-eyebrow">A trilha sonora</span><h3>{content.musicTitle || 'Uma música para esta história'} ♫</h3>{content.musicArtist&&<p>{content.musicArtist}</p>}<div className="story-video"><iframe src={`https://www.youtube-nocookie.com/embed/${video}`} title="Música escolhida" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div></section>}
      {content.senderName && <p className="story-signature">Com carinho, <strong>{content.senderName}</strong> ♡</p>}
    </div><footer className="story-footer">❧ Eterniza · Momentos que sempre ficam</footer></div>
  </article>;
}
