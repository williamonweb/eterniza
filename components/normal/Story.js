'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categoryFor } from '../../lib/normal/categories';
import { normalOpenings, openingKey } from '../../lib/normal/openings';
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
export default function Story({ content = {}, preview = false }) {
  const [now,setNow] = useState(null);
  const [open,setOpen] = useState(false);
  const [count,setCount] = useState(null);
  const [settings,setSettings] = useState(null);
  const [playing,setPlaying] = useState(false);
  const [activePhoto,setActivePhoto] = useState(null);
  const audioFrame=useRef(null);
  const playTimers=useRef([]);
  const storyRef=useRef(null);
  const closePhotoRef=useRef(null);
  const previousPhotoRef=useRef(null);
  const nextPhotoRef=useRef(null);
  const photoTriggerRef=useRef(null);
  useEffect(() => { setNow(new Date()); const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let alive=true;
    fetch('/api/settings').then(r=>r.json()).then(result=>{if(alive)setSettings(result.settings || {});}).catch(()=>{if(alive)setSettings({});});
    return ()=>{alive=false;};
  },[]);
  useEffect(()=>{if(settings && count===null)setCount(Math.max(0,Math.min(10,Number(settings.normalIntroCountdown ?? 3)||0)));},[settings,count]);
  const category = categoryFor(content.recipient?.id || content.category);
  const photos = Array.isArray(content.photos) ? content.photos : [];
  const stats = now && dateStats(content.specialDate, now);
  const memorial = category.id === 'homenagem';
  const video = youtubeId(content.youtubeLink);
  useEffect(()=>()=>{playTimers.current.forEach(clearTimeout);},[]);
  const first = photos[0] || category.image;
  const title = content.title?.trim() || content.receiverName?.trim() || 'Nossa história';
  useEffect(() => {if(open || count===null || count===0 || settings?.normalIntroEnabled===false)return; const timer=setTimeout(()=>setCount(value=>value-1),1000);return()=>clearTimeout(timer);},[open,count,settings]);
  const defaults=normalOpenings.find(item=>item.id===category.id) || normalOpenings[6];
  const phrases=defaults.lines.map((line,index)=>settings?.[openingKey(category.id,index+1)] || line);
  const revealed=open || settings?.normalIntroEnabled===false;
  const audioEnabled=Boolean(video && settings?.musicEnabled!==false);
  useEffect(()=>{
    if(!revealed || !storyRef.current)return;
    const sections=storyRef.current.querySelectorAll('[data-story-reveal]');
    if(!('IntersectionObserver' in window)){sections.forEach(section=>section.classList.add('is-visible'));return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
    sections.forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[revealed,photos.length]);
  useEffect(()=>{
    if(activePhoto===null)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    closePhotoRef.current?.focus();
    function handleKey(event){
      if(event.key==='Escape'){setActivePhoto(null);return;}
      if(event.key==='ArrowRight'){event.preventDefault();setActivePhoto(index=>(index+1)%photos.length);}
      if(event.key==='ArrowLeft'){event.preventDefault();setActivePhoto(index=>(index-1+photos.length)%photos.length);}
      if(event.key==='Tab'){
        const controls=[closePhotoRef.current,previousPhotoRef.current,nextPhotoRef.current].filter(Boolean);
        const index=controls.indexOf(document.activeElement);
        if(event.shiftKey&&index<=0){event.preventDefault();controls[controls.length-1]?.focus();}
        else if(!event.shiftKey&&index===controls.length-1){event.preventDefault();controls[0]?.focus();}
      }
    }
    document.addEventListener('keydown',handleKey);
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',handleKey);photoTriggerRef.current?.focus();};
  },[activePhoto===null,photos.length]);
  function openPhoto(index,event){photoTriggerRef.current=event.currentTarget;setActivePhoto(index);}
  function closePhoto(){setActivePhoto(null);}
  function audioSrc(autoPlay=false){
    const params=new URLSearchParams({autoplay:autoPlay?'1':'0',mute:'0',controls:'0',rel:'0',playsinline:'1',enablejsapi:'1',fs:'0'});
    if(typeof window!=='undefined')params.set('origin',window.location.origin);
    return `https://www.youtube.com/embed/${video}?${params}`;
  }
  function audioCommand(name,args=[]){try{audioFrame.current?.contentWindow?.postMessage(JSON.stringify({event:'command',func:name,args}),'https://www.youtube.com');}catch{}}
  function playAudio(){
    if(!audioEnabled || !audioFrame.current)return;
    playTimers.current.forEach(clearTimeout);
    // Trocar o endereço dentro do clique permite que o navegador associe o áudio ao gesto.
    const source=audioSrc(true);
    if(audioFrame.current.src!==source)audioFrame.current.src=source;
    const resume=()=>{audioCommand('unMute');audioCommand('setVolume',[Math.max(0,Math.min(100,Number(settings?.musicDefaultVolume ?? 68)))]);audioCommand('playVideo');};
    resume();
    playTimers.current=[180,650,1400].map(delay=>setTimeout(resume,delay));
    setPlaying(true);
  }
  function openLetter(){playAudio();setOpen(true);}
  function toggleAudio(){if(playing){playTimers.current.forEach(clearTimeout);audioCommand('pauseVideo');setPlaying(false);}else playAudio();}
  return <article ref={storyRef} className={`story story-${category.id}`} style={{'--story-accent':category.accent}}>
    {preview && <div className="story-preview-label">Pré-visualização · só você pode ver por enquanto</div>}
    {audioEnabled&&<iframe ref={audioFrame} className="story-audio-frame" src={audioSrc(false)} title="Áudio da história" allow="autoplay; encrypted-media" tabIndex={-1} aria-hidden="true" referrerPolicy="strict-origin-when-cross-origin" />}
    {settings && !revealed&&<div className="story-intro" aria-label="Uma carta especial para você">
      <div className="story-intro-stars" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</div>
      <span className="story-intro-kicker">Eterniza apresenta</span>
      <h2>{phrases[0]}</h2><p className="story-intro-phrase">{phrases[1]}</p>
      <div className="story-envelope" aria-hidden="true"><div className="story-envelope-flap"/><div className="story-envelope-face"/><div className="story-seal">E<span>✦</span></div></div>
      <p className="story-intro-recipient">{content.receiverName ? `Para ${content.receiverName}` : 'Uma lembrança feita com carinho'}</p>
      <div className="story-intro-bottom"><span className="story-intro-count" aria-live="polite">{count>0?`Sua surpresa começa em ${count}…`:'Sua carta está pronta ♡'}</span>{count===0&&<button type="button" className="story-open-button" onClick={openLetter}>Abrir a carta <span aria-hidden="true">↗</span></button>}</div>
    </div>}
    <div className={revealed?'story-reveal is-open':'story-reveal'} hidden={!revealed}>
    <div className="story-hero" style={{backgroundImage:`linear-gradient(0deg,rgba(25,19,16,.75),transparent 70%),url("${String(first).replace(/["\\]/g,'')}")`}}>
      <div data-story-reveal><span className="story-eyebrow">❧ Eterniza · {category.label}</span><h1>{title}</h1><p>{content.subtitle || 'Uma história para guardar para sempre.'}</p>{audioEnabled&&settings?.musicShowPlayer!==false&&<button type="button" className="story-audio-button" onClick={toggleAudio} aria-label={playing?'Pausar música':'Tocar música'}>{playing?'❚❚ Pausar música':'♫ Tocar música'}</button>}</div>
    </div>
    <div className="story-body"><span className="story-ornament" data-story-reveal>✦</span><h2 data-story-reveal>{memorial ? 'Uma história que vive em nós' : 'Cada momento merece ser lembrado'}</h2>
      {content.message && <p className="story-message" data-story-reveal>{content.message}</p>}
      {stats && <div className="story-date" data-story-reveal><span>{memorial ? 'Para sempre em nossos corações' : stats.future ? 'Contando os dias' : category.id === 'bebe' || category.id === 'aniversario' ? 'Celebrando a vida' : 'Nossa história em números'}</span><strong>{stats.future ? `${stats.days} dias para esse momento` : memorial ? `${stats.days.toLocaleString('pt-BR')} dias de memórias` : `${stats.days.toLocaleString('pt-BR')} dias de história`}</strong>{!stats.future && !memorial && <small>{stats.years} {stats.years === 1 ? 'ano' : 'anos'} · {stats.until === 0 ? 'Hoje é o dia! ♥' : `Próximo aniversário em ${stats.until} ${stats.until === 1 ? 'dia' : 'dias'}`}</small>}</div>}
      {photos.length > 0 && <section className="story-gallery" data-story-reveal aria-label="Fotos desta história">{photos.map((photo,i)=><button type="button" className="story-gallery-item" key={i} aria-label={`Ampliar foto ${i+1} de ${photos.length}`} onClick={event=>openPhoto(i,event)}><img src={photo} alt={`Lembrança ${i+1}`} loading="lazy" /></button>)}</section>}
      {audioEnabled&&content.musicTitle&&<p className="story-music-credit" data-story-reveal>♫ Nossa música: {content.musicTitle}{content.musicArtist&&` · ${content.musicArtist}`}</p>}
      {content.senderName && <p className="story-signature" data-story-reveal>Com carinho, <strong>{content.senderName}</strong> ♡</p>}
    </div><footer className="story-footer">❧ Eterniza · Momentos que sempre ficam</footer></div>
    {activePhoto!==null&&photos.length>0&&typeof document!=='undefined'&&createPortal(<div className="story-lightbox" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)closePhoto();}}><div className="story-lightbox-panel" role="dialog" aria-modal="true" aria-label={`Foto ${activePhoto+1} de ${photos.length}`}><button ref={closePhotoRef} type="button" className="story-lightbox-close" onClick={closePhoto} aria-label="Fechar foto">×</button><img src={photos[activePhoto]} alt={`Lembrança ${activePhoto+1} ampliada`}/><div className="story-lightbox-controls"><span>{activePhoto+1} / {photos.length}</span>{photos.length>1&&<div><button ref={previousPhotoRef} type="button" onClick={()=>setActivePhoto(index=>(index-1+photos.length)%photos.length)} aria-label="Foto anterior">←</button><button ref={nextPhotoRef} type="button" onClick={()=>setActivePhoto(index=>(index+1)%photos.length)} aria-label="Próxima foto">→</button></div>}</div></div></div>,document.body)}
  </article>;
}
