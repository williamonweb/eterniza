'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from './Shell';
import Story, { youtubeId } from './Story';
import { categories, categoryFor, steps, stepNames } from '../../lib/normal/categories';

const empty = { builderVersion:'2.0', recipient:null, title:'', receiverName:'', senderName:'', subtitle:'', message:'', specialDate:'', photos:[], youtubeLink:'', plan:null };
const storageKey = userId => `eterniza:normal:draft:${userId}`;
const contentKey = userId => `eterniza:normal:content:${userId}`;
function compressImage(file) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader(); reader.onerror=()=>reject(new Error('Não foi possível ler a foto.')); reader.onload=()=>{
      const image=new Image(); image.onerror=()=>reject(new Error('Imagem inválida.')); image.onload=()=>{
        const scale=Math.min(1,900/Math.max(image.width,image.height));
        const canvas=document.createElement('canvas'); canvas.width=Math.round(image.width*scale); canvas.height=Math.round(image.height*scale);
        canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL('image/jpeg',.66));
      }; image.src=reader.result;
    }; reader.readAsDataURL(file);
  });
}
export default function Wizard({ step }) {
  const router=useRouter(); const search=useSearchParams();
  const [data,setData]=useState(empty); const [id,setId]=useState(''); const [ready,setReady]=useState(false);
  const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [maxPhotos,setMaxPhotos]=useState(20); const [userId,setUserId]=useState('');
  const [musicQuery,setMusicQuery]=useState(''); const [musicResults,setMusicResults]=useState([]); const [musicLoading,setMusicLoading]=useState(false); const [musicNotice,setMusicNotice]=useState('');
  const [musicSearchEnabled,setMusicSearchEnabled]=useState(true);
  const queue=useRef(Promise.resolve()); const latest=useRef(empty); const idRef=useRef(''); const readyRef=useRef(false);
  function update(patch) { setData(current=>{ const next={...current,...patch};latest.current=next;return next; });setError(''); }
  useEffect(()=>{
    let alive=true;
    (async()=>{
      try {
        const auth=await fetch('/api/auth/me').then(r=>r.json());
        const uid=auth.ok ? auth.user.id : 'guest';setUserId(uid);
        let draftId=search.get('id') || localStorage.getItem(storageKey(uid));
        let loaded=false;
        if(draftId){
          const res=await fetch(`/api/tributes/draft?id=${encodeURIComponent(draftId)}`);
          if(res.ok){const saved=await res.json();if(saved.tribute.status==='publicado'){localStorage.removeItem(storageKey(uid));localStorage.removeItem(contentKey(uid));window.location.replace(`/p/${encodeURIComponent(saved.tribute.slug)}`);return;}if(alive){const content={...empty,...saved.tribute.content};latest.current=content;setData(content);idRef.current=draftId;setId(draftId);loaded=true;}}
          else {localStorage.removeItem(storageKey(uid));draftId=null; if(search.get('id')) setError('Não foi possível abrir este rascunho. Você pode começar uma nova página.');}
        }
        if(!loaded){try{const local=JSON.parse(localStorage.getItem(contentKey(uid))||'null');if(local?.builderVersion==='2.0'&&alive){latest.current={...empty,...local};setData(latest.current);}}catch{}}
        if(alive){readyRef.current=true;setReady(true);}
      }catch {if(alive){setError('Não foi possível carregar sua página. Confira a conexão.');setReady(true);}}
    })();
    fetch('/api/plans').then(r=>r.json()).then(p=>{if(p.ok&&p.plans.length)setMaxPhotos(Math.max(...p.plans.map(item=>Number(item.photos||0))));}).catch(()=>{});
    fetch('/api/settings').then(r=>r.json()).then(result=>{if(result.ok)setMusicSearchEnabled(result.settings?.youtubeSearchEnabled!==false);}).catch(()=>{});
    return()=>{alive=false;};
  },[]);
  function save(snapshot=latest.current){
    if(!readyRef.current || !snapshot.recipient?.id) return Promise.resolve(idRef.current);
    setSaving(true);
    const operation=queue.current.catch(()=>{}).then(async()=>{
      const response=await fetch('/api/tributes/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tributeId:idRef.current||undefined,content:snapshot})});
      const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||'Não foi possível salvar.');
      idRef.current=result.tribute.id;setId(result.tribute.id);localStorage.setItem(storageKey(userId),result.tribute.id);return result.tribute.id;
    }); queue.current=operation; operation.then(()=>{if(queue.current===operation)setSaving(false);}).catch(err=>{setError(err.message);setSaving(false);});return operation;
  }
  useEffect(()=>{
    if(ready&&userId){try{localStorage.setItem(contentKey(userId),JSON.stringify(data));}catch{}}
    if(!ready || !data.recipient?.id)return;
    const timer=setTimeout(()=>save(data).catch(()=>{}),900);
    return()=>clearTimeout(timer);
  },[data,ready,userId]);
  const index=steps.indexOf(step);
  async function goNext(){
    if(step==='tipo'&&!data.recipient?.id)return setError('Escolha o tipo de página para continuar.');
    if(step==='historia'&&(!data.title.trim()||!data.message.trim()))return setError('Escreva um título e uma mensagem para continuar.');
    try {const savedId=await save();if(!savedId)throw new Error('Não foi possível salvar sua página. Tente novamente.');router.push(index===steps.length-1 ? `/planos?id=${savedId}` : `/criar/${steps[index+1]}?id=${savedId}`);}catch(e){setError(e.message);}
  }
  function goBack(){router.push(index===0?'/':`/criar/${steps[index-1]}${id?`?id=${id}`:''}`);}
  async function addPhotos(event){
    try {const files=Array.from(event.target.files||[]);if(!files.length)return;
      if(data.photos.length+files.length>maxPhotos)throw new Error(`Escolha até ${maxPhotos} fotos no total. O limite final depende do plano escolhido.`);
      const images=await Promise.all(files.map(file=>{if(!file.type.startsWith('image/'))throw new Error('Selecione somente imagens.');if(file.size>12*1024*1024)throw new Error('Cada foto deve ter até 12 MB.');return compressImage(file);}));
      const combined=[...latest.current.photos,...images];if(JSON.stringify(combined).length>3_300_000)throw new Error('Essas fotos juntas ficaram muito grandes. Escolha imagens menores ou remova algumas.');update({photos:combined});event.target.value='';
    }catch(e){setError(e.message);}
  }
  async function searchMusic(event) {
    event.preventDefault();
    const query=musicQuery.trim();
    if(query.length<2){setMusicNotice('Digite o nome da música ou do artista.');return;}
    setMusicLoading(true);setMusicNotice('');setMusicResults([]);
    try {
      const response=await fetch(`/api/normal/youtube/search?q=${encodeURIComponent(query)}`,{cache:'no-store'});
      const result=await response.json();
      if(!response.ok || !result.ok)throw new Error(result.message || 'Busca indisponível.');
      setMusicResults(result.results || []);
      if(!result.results?.length)setMusicNotice('Nenhuma música encontrada. Tente outro nome ou artista.');
    }catch(e){setMusicNotice(e.message);}
    finally{setMusicLoading(false);}
  }
  const selected=categoryFor(data.recipient?.id);
  return <Shell compact storyWide={step==='preview'}><div className="normal-kicker">Criação simples, em poucos passos</div><div className="normal-progress" aria-label="Progresso da criação">{steps.map((name,i)=><span key={name} className={i===index?'active':''}>{i+1}. {stepNames[i]}</span>)}</div><div className="normal-card">
    {!ready ? <p>Carregando sua página…</p> : <>
    {step==='tipo'&&<><div className="normal-center"><h1 className="normal-heading">Escolha o tipo de página</h1><p className="normal-subtitle">Qual momento você quer celebrar?</p></div><div className="normal-grid normal-type-grid">{categories.map(cat=><button type="button" key={cat.id} aria-pressed={data.recipient?.id===cat.id} className={`normal-choice ${data.recipient?.id===cat.id?'selected':''}`} onClick={()=>update({recipient:{id:cat.id}})}><img src={cat.image} alt=""/><strong><span className="normal-choice-icon">{cat.icon}</span>{cat.label}</strong></button>)}</div><p className="normal-type-note">Todo tipo de amor merece uma página. ♡</p></>}
    {step==='historia'&&<><span className="normal-pill">{selected.icon} {selected.label}</span><h1 className="normal-heading">Conte essa história do seu jeito</h1><p className="normal-subtitle">Escreva como se estivesse conversando com quem vai receber a página.</p><label className="normal-field">Título da página<input required maxLength={90} value={data.title} onChange={e=>update({title:e.target.value})} placeholder="Ex.: Nossos 5 anos de amor" /></label><div className="normal-two"><label className="normal-field">Para quem é esta página?<input maxLength={90} value={data.receiverName} onChange={e=>update({receiverName:e.target.value})} placeholder="Nome ou apelido" /></label><label className="normal-field">Seu nome (opcional)<input maxLength={90} value={data.senderName} onChange={e=>update({senderName:e.target.value})} placeholder="Como quer assinar?" /></label></div><label className="normal-field">Uma frase de abertura (opcional)<input maxLength={140} value={data.subtitle} onChange={e=>update({subtitle:e.target.value})} placeholder="Ex.: Cada dia ao seu lado é especial" /></label><label className="normal-field">Sua mensagem<textarea maxLength={2000} value={data.message} onChange={e=>update({message:e.target.value})} placeholder="Conte uma lembrança, um agradecimento ou o que sente..."/><small>{data.message.length}/2000 caracteres</small></label></>}
    {step==='datas'&&<><h1 className="normal-heading">Uma data para guardar</h1><p className="normal-subtitle">Ela dá vida ao contador de tempo juntos e mostra o próximo aniversário. Para um memorial, exibe os dias de memórias.</p><label className="normal-field">{selected.id==='namoro'?'Quando a história de vocês começou?':selected.id==='casamento'?'Qual foi a data do casamento?':selected.id==='bebe'?'Quando o bebê nasceu?':selected.id==='homenagem'?'Uma data marcante da história':selected.id==='pet'?'Quando seu pet chegou ou nasceu?':'Qual é a data especial?'}<input type="date" value={data.specialDate||''} onChange={e=>update({specialDate:e.target.value})}/><small>Você pode deixar em branco e seguir.</small></label><div className="normal-card" style={{background:'#f7f0e6'}}><strong>O que aparecerá na página?</strong><p style={{marginBottom:0}}>Dias juntos, anos de história e contagem até o próximo aniversário, atualizados automaticamente.</p></div></>}
    {step==='fotos'&&<><h1 className="normal-heading">Escolha suas fotos favoritas</h1><p className="normal-subtitle">Uma foto já conta uma história. A primeira será a capa da página.</p><label className="normal-field">Adicionar fotos<input type="file" accept="image/*" multiple onChange={addPhotos}/><small>{data.photos.length} de até {maxPhotos} fotos · O plano escolhido pode ter um limite menor.</small></label><div className="normal-photo-grid">{data.photos.map((photo,i)=><div className="normal-photo" key={i}><img src={photo} alt={`Foto ${i+1}`}/><button type="button" aria-label={`Remover foto ${i+1}`} onClick={()=>update({photos:data.photos.filter((_,n)=>n!==i)})}>×</button></div>)}</div></>}
    {step==='musica'&&<><h1 className="normal-heading">Qual música lembra esse momento?</h1><p className="normal-subtitle">Busque pelo nome da música ou do artista. Escolha com um toque; esta etapa é opcional.</p>{musicSearchEnabled?<><form className="normal-music-search" onSubmit={searchMusic}><label className="normal-field" htmlFor="normal-music-query">Buscar música no YouTube<input id="normal-music-query" type="search" value={musicQuery} onChange={e=>setMusicQuery(e.target.value)} placeholder="Ex.: Perfect, Ed Sheeran" autoComplete="off" /></label><button type="submit" className="normal-button" disabled={musicLoading}>{musicLoading?'Buscando…':'Buscar'}</button></form>{musicNotice&&<p role="status" className="normal-hint">{musicNotice}</p>}{musicResults.length>0&&<div className="normal-music-results" aria-label="Resultados da busca">{musicResults.map(item=><button type="button" className={`normal-music-result ${youtubeId(data.youtubeLink)===item.id?'selected':''}`} key={item.id} onClick={()=>update({youtubeLink:item.url,musicTitle:item.title,musicArtist:item.channel})}><img src={item.thumb} alt="" loading="lazy"/><span><strong>{item.title}</strong><small>{item.channel}</small></span><b>{youtubeId(data.youtubeLink)===item.id?'✓':'Escolher'}</b></button>)}</div>}</>:<p className="normal-hint">A busca de músicas está temporariamente desativada. Você pode continuar sem música.</p>}{youtubeId(data.youtubeLink)&&<div className="normal-music-picked"><span>♫ Música escolhida: <strong>{data.musicTitle || 'Música do YouTube'}</strong>{data.musicArtist&&` · ${data.musicArtist}`}</span><button type="button" onClick={()=>update({youtubeLink:'',musicTitle:'',musicArtist:''})}>Remover</button></div>}</>}
    {step==='preview'&&<><h1 className="normal-heading">Sua página está ficando linda</h1><p className="normal-subtitle">Confira os detalhes. Volte a qualquer etapa se quiser alterar algo antes de escolher o plano.</p><div className="normal-preview-frame"><Story content={data} preview /></div></>}
    {error&&<p role="alert" className="normal-alert">{error}</p>}<p className="normal-hint" aria-live="polite">{saving?'Salvando alterações…':id?'Progresso salvo automaticamente. Você pode continuar depois.':'Seu progresso será salvo assim que escolher o tipo de página.'}</p><div className="normal-actions"><button type="button" className="normal-button secondary" onClick={goBack}>← Voltar</button><button type="button" className="normal-button" disabled={saving} onClick={goNext}>{step==='preview'?'Escolher plano':'Continuar'} →</button></div>
    </>}
  </div></Shell>;
}
