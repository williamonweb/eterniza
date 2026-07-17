"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPetStory } from "../../lib/pets/story-engine";

const DEFAULT_ONDA_LOGO = "/eterniza/assets/pets/brands/logo-onda-card.png";
const ETERNIZA_LOGO = "/eterniza/assets/pets/brands/logo-eterniza-card.png";

function paragraphs(value) {
  return String(value || "").split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function youtubeId(value) {
  const text = String(value || "");
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/[^a-zA-Z0-9_-]/g, "");
  }
  return "";
}

export default function PetStoryExperience({ experience, preview=false, onClose }) {
  const [opened,setOpened]=useState(false);
  const [introStep,setIntroStep]=useState(0);
  const [storyVisible,setStoryVisible]=useState(false);
  const [musicPlaying,setMusicPlaying]=useState(false);
  const [shareFeedback,setShareFeedback]=useState("");
  const audioRef=useRef(null);
  const youtubeRef=useRef(null);
  const storyRef=useRef(null);

  const data=experience||{};
  const clinic=data.clinic||{};
  const photos=Array.isArray(data.photos)?data.photos:[];
  const story=useMemo(()=>data.storyData||buildPetStory(data),[data]);
  const typeContent=story;
  const messageParagraphs=paragraphs(data.message);
  const accent=story.palette||data.themeColor||clinic.primaryColor||"#277ed4";
  const ytId=youtubeId(data.musicUrl);
  const clinicLogo=clinic.logoUrl||DEFAULT_ONDA_LOGO;

  useEffect(()=>{
    if(!opened)return;
    const timings=story.timings||{first:900,second:5000,third:9100,reveal:12900};
    const timers=[
      setTimeout(()=>setIntroStep(1),timings.first),
      setTimeout(()=>setIntroStep(2),timings.second),
      setTimeout(()=>setIntroStep(3),timings.third),
      setTimeout(()=>{
        setStoryVisible(true);
        setTimeout(()=>storyRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),180);
      },timings.reveal),
    ];
    return()=>timers.forEach(clearTimeout);
  },[opened,story]);

  function youtubeCommand(command) {
    youtubeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event:"command", func:command, args:[] }),
      "*"
    );
  }

  async function openExperience() {
    setOpened(true);
    setIntroStep(0);
    if(ytId) {
      setMusicPlaying(true);
      setTimeout(()=>youtubeCommand("playVideo"),700);
    } else if(data.musicUrl&&audioRef.current) {
      try {
        audioRef.current.volume=.58;
        await audioRef.current.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    }
  }

  function skipIntro() {
    setStoryVisible(true);
    setIntroStep(3);
    setTimeout(()=>storyRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  async function toggleMusic() {
    if(ytId) {
      youtubeCommand(musicPlaying?"pauseVideo":"playVideo");
      setMusicPlaying((current)=>!current);
      return;
    }
    if(!audioRef.current)return;
    if(audioRef.current.paused) {
      try { await audioRef.current.play(); setMusicPlaying(true); }
      catch { setMusicPlaying(false); }
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  }

  async function shareExperience() {
    if(preview) {
      setShareFeedback("O compartilhamento será liberado após publicar.");
      setTimeout(()=>setShareFeedback(""),2500);
      return;
    }
    const url=window.location.href;
    try {
      if(navigator.share) {
        await navigator.share({title:`Uma experiência especial para ${data.petName}`,text:data.title,url});
        setShareFeedback("Compartilhado com sucesso.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copiado.");
      }
    } catch(error) {
      if(error?.name!=="AbortError") setShareFeedback("Não foi possível compartilhar agora.");
    }
    setTimeout(()=>setShareFeedback(""),2800);
  }

  async function copyLink() {
    if(preview) {
      setShareFeedback("O link será criado após publicar.");
    } else {
      try { await navigator.clipboard.writeText(window.location.href); setShareFeedback("Link copiado."); }
      catch { setShareFeedback("Não foi possível copiar."); }
    }
    setTimeout(()=>setShareFeedback(""),2600);
  }

  return (
    <main className={`pet-story ${preview?"preview-mode":""}`} style={{"--accent":accent}}>
      <Style/>

      {preview&&(
        <div className="preview-toolbar">
          <div><strong>Prévia completa</strong><span>É exatamente assim que o tutor verá</span></div>
          <button onClick={onClose}>Fechar prévia</button>
        </div>
      )}

      {!!data.musicUrl&&!ytId&&(
        <audio ref={audioRef} src={data.musicUrl} loop preload="auto" onPlay={()=>setMusicPlaying(true)} onPause={()=>setMusicPlaying(false)}/>
      )}
      {ytId&&(
        <iframe
          ref={youtubeRef}
          className="youtube-audio-frame"
          src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&playsinline=1&controls=0&loop=1&playlist=${ytId}&rel=0`}
          title="Música da experiência"
          allow="autoplay; encrypted-media"
        />
      )}

      {!opened&&(
        <section className="opening-cover">
          <div className="cover-glow"/>
          <div className="cover-content">
            <div className="dual-logo-header">
              <div className="logo-soft-card"><img src={clinicLogo} alt={clinic.tradeName||"Clínica"}/></div>
              <span>×</span>
              <div className="logo-soft-card eterniza-logo-card"><img src={ETERNIZA_LOGO} alt="Eterniza"/></div>
            </div>
            <small className="prepared-by">Uma experiência preparada por {clinic.tradeName||"sua clínica"}</small>
            <div className="cover-icon">{typeContent.icon}</div>
            <span className="cover-eyebrow">{typeContent.eyebrow}</span>
            <h1>Existe algo especial esperando por você.</h1>
            <p>Coloque o som e reserve alguns minutos para viver esta história.</p>
            <button className="open-button" onClick={openExperience}><span>▶</span>Abrir esta experiência</button>
            <small className="sound-hint">{data.musicUrl?"A música começará após o clique.":"Experiência sem música."}</small>
          </div>
        </section>
      )}

      {opened&&!storyVisible&&(
        <section className="cinematic-intro">
          <div className={`intro-scene ${introStep===0?"active":""}`}><small>{clinic.tradeName}</small><h2>preparou algo muito especial...</h2></div>
          <div className={`intro-scene ${introStep===1?"active":""}`}><span>{typeContent.icon}</span><h2>{story.intro?.[0]}</h2></div>
          <div className={`intro-scene ${introStep===2?"active":""}`}><h2>{story.intro?.[1]}</h2></div>
          <div className={`intro-scene pet-reveal ${introStep===3?"active":""}`}><small>{story.intro?.[2] || "Esta história é sobre"}</small><h2>{data.petName}</h2></div>
          <button className="skip-button" onClick={skipIntro}>Pular introdução</button>
        </section>
      )}

      <section ref={storyRef} className={`story ${storyVisible?"visible":""}`}>
        <header className="story-hero">
          <div className="hero-glow"/>
          <div className="story-hero-copy">
            <span>{typeContent.icon} {typeContent.eyebrow}</span>
            <h1>{data.petName}</h1>
            <p>{data.title}</p>
          </div>
          <div className="hero-photo-card">
            {photos[0]?<img src={photos[0].dataUrl||photos[0]} alt={data.petName}/>:<div className="photo-placeholder">🐾</div>}
            <i/>
            <b>{data.petName}</b>
          </div>
          <button className="continue-story" onClick={()=>document.querySelector(".letter-scene")?.scrollIntoView({behavior:"smooth"})}>Continuar esta história ↓</button>
        </header>

        <section className="emotion-scene">
          <span>Para {data.tutorName},</span>
          <h2>{story.emotionTitle}</h2>
        </section>

        {photos.length>1&&(
          <section className="photo-chapters">
            {photos.slice(1).map((photo,index)=>(
              <article className={`photo-chapter ${index%2?"reverse":""}`} key={`${photo.name||"foto"}-${index}`}>
                <div className="chapter-photo-card">
                  <img src={photo.dataUrl||photo} alt={`${data.petName} ${index+2}`}/>
                  <span>{String(index+1).padStart(2,"0")}</span>
                </div>
                <div className="chapter-copy"><small>Capítulo {String(index+1).padStart(2,"0")}</small><h2>{story.chapters?.[index]?.[0] || "Um momento especial"}</h2><p>{story.chapters?.[index]?.[1] || `${data.petName} faz parte de uma história única.`}</p></div>
              </article>
            ))}
          </section>
        )}

        <section className="letter-scene">
          <div className="letter-card">
            <div className="letter-mark">“</div>
            <small>Uma mensagem para você</small>
            <h2>Para {data.tutorName},</h2>
            <div className="letter-content">{messageParagraphs.map((paragraph,index)=><p key={index} style={{"--delay":`${index*.18}s`}}>{paragraph}</p>)}</div>
            <div className="clinic-signature">{clinic.signature||`Com carinho, equipe ${clinic.tradeName||"da clínica"}.`}</div>
          </div>
        </section>

        <section className="final-scene">
          <span>{typeContent.icon}</span>
          <h2>{story.finalTitle}</h2>
          <p>{story.finalText}</p>
          <div className="final-actions">
            <button onClick={shareExperience}>Compartilhar</button>
            <button className="secondary" onClick={copyLink}>Copiar link</button>
            {data.musicUrl&&<button className="secondary" onClick={toggleMusic}>{musicPlaying?"Pausar música":"Tocar música"}</button>}
          </div>
          {shareFeedback&&<div className="share-feedback">{shareFeedback}</div>}
        </section>

        {clinic.showEternizaCta!==false&&(
          <section className="discover-eterniza">
            <div className="discover-glow"/>
            <div className="discover-copy">
              <small>Onde cada história vive para sempre.</small>
              <h2>Conheça o <span>Eterniza</span></h2>
              <p>
                Crie homenagens emocionantes para pessoas e animais com fotos,
                música, mensagens e uma experiência feita para ser lembrada.
              </p>
              <div className="discover-benefits">
                <div><b>♡</b><span>Histórias com amor</span></div>
                <div><b>▧</b><span>Fotos e músicas</span></div>
                <div><b>∞</b><span>Memórias para sempre</span></div>
              </div>
              {!preview&&(
                <a
                  href="/"
                >
                  "Conhecer o Eterniza"
                </a>
              )}
              {preview&&<button type="button">Conhecer o Eterniza</button>}
            </div>
            <div className="discover-brand">
              <div className="discover-logo-card">
                <img src={ETERNIZA_LOGO} alt="Eterniza"/>
              </div>
              <strong>Eterniza</strong>
              <span>Histórias que permanecem.</span>
            </div>
          </section>
        )}

        <footer className="powered-footer">
          <div className="footer-logos">
            <div className="logo-soft-card footer-logo-card"><img src={clinicLogo} alt={clinic.tradeName||"Clínica"}/></div>
            <span>em parceria com</span>
            <div className="logo-soft-card footer-logo-card eterniza-logo-card"><img src={ETERNIZA_LOGO} alt="Eterniza"/></div>
          </div>
        </footer>

        {data.musicUrl&&<button className="floating-music" onClick={toggleMusic}>{musicPlaying?"♫":"▶"}</button>}
      </section>
    </main>
  );
}

function Style() {
  return <style>{`
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}.pet-story{min-height:100vh;background:#02070b;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;overflow:hidden}.preview-mode{position:fixed;inset:0;z-index:200;overflow:auto}.preview-toolbar{position:fixed;left:0;right:0;top:0;z-index:300;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:rgba(2,7,11,.94);border-bottom:1px solid rgba(255,255,255,.1)}.preview-toolbar strong,.preview-toolbar span{display:block}.preview-toolbar span{color:#8fa4b1;font-size:11px}.preview-toolbar button{min-height:40px;padding:0 15px;border:1px solid rgba(255,255,255,.15);border-radius:11px;background:rgba(255,255,255,.06);color:#fff}.preview-mode .opening-cover,.preview-mode .cinematic-intro{top:65px}.youtube-audio-frame{position:fixed;left:-9999px;top:-9999px;width:2px;height:2px;opacity:.01;pointer-events:none}.opening-cover,.cinematic-intro{position:fixed;inset:0;z-index:50;display:grid;place-items:center;text-align:center;padding:clamp(14px,3vh,28px) 20px;background:radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 34%),linear-gradient(180deg,#06131d,#02070b);min-height:100vh;min-height:100svh;min-height:100dvh;overflow-y:auto;overscroll-behavior:contain}.cover-glow,.hero-glow{position:absolute;width:min(70vw,760px);height:min(70vw,760px);border-radius:50%;background:color-mix(in srgb,var(--accent) 14%,transparent);filter:blur(90px)}.cover-content{position:relative;z-index:2;width:min(760px,100%);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:min(900px,calc(100dvh - 40px));padding:clamp(8px,2vh,18px) 0}.dual-logo-header{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px;flex-wrap:nowrap}.dual-logo-header span{color:#8296a4;font-size:18px;flex:0 0 auto}.logo-soft-card{position:relative;display:flex;align-items:center;justify-content:center;width:clamp(126px,15vw,156px);height:clamp(88px,10vw,104px);padding:14px 18px;border:1px solid rgba(255,255,255,.72);border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.28),0 0 28px rgba(255,255,255,.16)}.logo-soft-card:after{content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 18px rgba(255,255,255,.95),inset 0 0 3px rgba(120,140,155,.18)}.logo-soft-card img{position:relative;z-index:1;display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:center;margin:auto;transform:scale(.82);transform-origin:center}.eterniza-logo-card img{transform:scale(.76);transform-origin:center}.prepared-by{display:block;color:#9bb0bc;margin-top:0;line-height:1.35}.cover-icon{font-size:52px;margin-top:24px}.cover-eyebrow{display:block;color:#90d2ff;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.12em;margin-top:16px}.cover-content h1{font:700 clamp(34px,6.2vw,72px)/1 Georgia,serif;margin:clamp(10px,2vh,16px) 0;max-width:760px}.cover-content p{color:#a9bdc9;font-size:clamp(15px,2vw,18px);line-height:1.45;max-width:650px;margin:0}.open-button{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:58px;margin-top:clamp(16px,2.5vh,24px);padding:0 26px;border:0;border-radius:17px;background:linear-gradient(135deg,var(--accent),#a9ddff);color:#03101a;font-weight:1000;flex:0 0 auto;position:relative;z-index:4;box-shadow:0 18px 48px color-mix(in srgb,var(--accent) 28%,transparent)}.open-button span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.35)}.sound-hint{display:block;color:#738b9a;margin-top:10px;font-size:12px}.cinematic-intro{z-index:45}.intro-scene{position:absolute;width:min(900px,88vw);opacity:0;transform:translateY(20px);transition:.8s;pointer-events:none}.intro-scene.active{opacity:1;transform:none}.intro-scene small{display:block;color:#85cdfd;text-transform:uppercase}.intro-scene span{font-size:60px}.intro-scene h2{font:700 clamp(40px,7vw,78px)/1.06 Georgia,serif}.pet-reveal h2{font-size:clamp(70px,13vw,155px)}.skip-button{position:absolute;right:24px;bottom:24px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.05);color:#aebfca;border-radius:12px;padding:11px 16px}.story{display:none;opacity:0}.story.visible{display:block;opacity:1}.story-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 70px;overflow:hidden}.story-hero-copy{position:relative;z-index:2;text-align:center}.story-hero-copy span{color:#9dd8ff;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}.story-hero-copy h1{font:700 clamp(64px,12vw,145px)/.82 Georgia,serif;margin:24px 0}.story-hero-copy p{color:#b6c8d3;font-size:20px}.hero-photo-card{position:relative;z-index:2;width:min(720px,92vw);margin-top:32px;padding:18px 18px 56px;border-radius:31px;background:linear-gradient(145deg,#fffaf1,#e9dfcf);box-shadow:0 40px 120px rgba(0,0,0,.52);transform:rotate(-1.2deg)}.hero-photo-card img,.photo-placeholder{width:100%;height:min(62vh,610px);object-fit:cover;border-radius:20px;background:#dfe7ec;display:grid;place-items:center;font-size:80px}.hero-photo-card i{position:absolute;left:50%;top:-17px;width:115px;height:35px;transform:translateX(-50%) rotate(2deg);background:rgba(235,218,178,.78);box-shadow:0 5px 12px rgba(0,0,0,.12)}.hero-photo-card b{position:absolute;left:0;right:0;bottom:17px;text-align:center;color:#29333b;font:700 28px "Segoe Print",Georgia,serif}.continue-story{position:relative;z-index:2;margin-top:45px;padding:14px 20px;border:1px solid rgba(255,255,255,.2);border-radius:14px;background:rgba(255,255,255,.05);color:#fff}.emotion-scene{min-height:75vh;display:grid;place-content:center;text-align:center;padding:70px 24px}.emotion-scene h2{width:min(1000px,90vw);font:700 clamp(44px,7vw,86px)/1.08 Georgia,serif}.photo-chapters{width:min(1120px,100%);margin:auto;padding:50px 24px}.photo-chapter{min-height:70vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:70px}.photo-chapter.reverse .chapter-photo-card{order:2}.chapter-photo-card{position:relative;padding:15px 15px 48px;border-radius:27px;background:#fffaf1;box-shadow:0 35px 95px rgba(0,0,0,.45);transform:rotate(1.3deg)}.photo-chapter.reverse .chapter-photo-card{transform:rotate(-1.3deg)}.chapter-photo-card img{width:100%;height:min(62vh,560px);object-fit:cover;border-radius:17px}.chapter-photo-card span{position:absolute;right:22px;bottom:14px;color:#35434c;font:700 24px Georgia,serif}.chapter-copy h2{font:700 clamp(42px,5vw,72px)/1 Georgia,serif}.chapter-copy p{color:#aebfca;font-size:19px;line-height:1.7}.letter-scene{min-height:100vh;display:grid;place-items:center;padding:90px 24px}.letter-card{position:relative;width:min(860px,100%);padding:65px clamp(28px,7vw,75px);border-radius:32px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}.letter-mark{position:absolute;right:35px;top:20px;font:700 120px Georgia,serif;color:color-mix(in srgb,var(--accent) 24%,transparent)}.letter-card h2{font:700 clamp(36px,5vw,58px) Georgia,serif}.letter-content p{opacity:0;transform:translateY(16px);white-space:pre-wrap;color:#d6e0e6;font:400 clamp(18px,2vw,22px)/1.9 Georgia,serif;animation:letterIn .8s ease forwards;animation-delay:var(--delay)}.clinic-signature{margin-top:42px;padding-top:25px;border-top:1px solid rgba(255,255,255,.1)}.final-scene{min-height:80vh;display:grid;place-content:center;text-align:center;padding:80px 24px}.final-scene h2{width:min(950px,92vw);font:700 clamp(45px,7vw,82px)/1.05 Georgia,serif}.final-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.final-actions button{min-height:53px;padding:0 22px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--accent),#9fd9ff);font-weight:1000}.final-actions button.secondary{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff}.share-feedback{color:#8ee2b3;margin-top:14px}.discover-eterniza{position:relative;width:min(1180px,calc(100% - 32px));margin:40px auto 70px;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);align-items:center;gap:50px;padding:clamp(34px,6vw,70px);overflow:hidden;border:1px solid color-mix(in srgb,var(--accent) 34%,rgba(255,255,255,.08));border-radius:34px;background:linear-gradient(145deg,rgba(8,20,31,.98),rgba(3,10,16,.98));box-shadow:0 36px 110px rgba(0,0,0,.42)}.discover-glow{position:absolute;right:-120px;top:-140px;width:470px;height:470px;border-radius:50%;background:color-mix(in srgb,var(--accent) 18%,transparent);filter:blur(80px);pointer-events:none}.discover-copy{position:relative;z-index:2}.discover-copy small{color:#93d4ff;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.12em}.discover-copy h2{font:700 clamp(42px,6vw,76px)/1 Georgia,serif;margin:14px 0 18px}.discover-copy h2 span{color:#d5ad64}.discover-copy p{max-width:700px;color:#b1c2cc;font-size:18px;line-height:1.65}.discover-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin:28px 0}.discover-benefits div{display:grid;gap:7px;padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}.discover-benefits b{color:#e0b76a;font-size:25px}.discover-benefits span{color:#d8e3e9;font-size:12px;font-weight:850}.discover-copy a,.discover-copy button{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 24px;border:0;border-radius:14px;background:linear-gradient(135deg,#d7ad62,#f2d694);color:#07111a;text-decoration:none;font-weight:1000;box-shadow:0 15px 40px rgba(215,173,98,.2)}.discover-brand{position:relative;z-index:2;text-align:center}.discover-logo-card{display:flex;align-items:center;justify-content:center;width:min(330px,100%);aspect-ratio:1.15/1;margin:auto;padding:30px;border-radius:31px;background:#fff;box-shadow:0 28px 75px rgba(0,0,0,.38),0 0 38px rgba(255,255,255,.1)}.discover-logo-card img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:center;margin:auto;transform:scale(.72);transform-origin:center}.discover-brand strong,.discover-brand span{display:block}.discover-brand strong{font:700 31px Georgia,serif;margin-top:20px}.discover-brand span{color:#849aa8;margin-top:5px}.powered-footer{display:flex;flex-direction:column;align-items:center;gap:20px;padding:45px 24px;border-top:1px solid rgba(255,255,255,.08)}.footer-logos{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}.footer-logo-card{width:138px;height:92px}.footer-logos span{color:#718895;font-size:11px;text-transform:uppercase}.powered-footer a{color:#9ed8ff;font-weight:900;text-decoration:none}.floating-music{position:fixed;right:22px;bottom:22px;z-index:80;width:56px;height:56px;border:0;border-radius:50%;background:var(--accent);color:#04111b;font-size:22px}@keyframes letterIn{to{opacity:1;transform:none}}@media(max-width:820px){.discover-eterniza{grid-template-columns:1fr;gap:32px;text-align:center}.discover-copy p{margin-left:auto;margin-right:auto}.discover-benefits{grid-template-columns:1fr}.discover-copy a,.discover-copy button{width:100%}.discover-logo-card{width:min(270px,80vw)}.photo-chapter{grid-template-columns:1fr;gap:35px}.photo-chapter.reverse .chapter-photo-card{order:0}.footer-logos span{width:100%;text-align:center}.hero-photo-card{padding:12px 12px 48px}.hero-photo-card img,.photo-placeholder{height:52vh}.cover-content{min-height:auto}.opening-cover{align-items:start}.dual-logo-header{gap:9px;margin-bottom:14px}.logo-soft-card{width:108px;height:78px;padding:7px 9px}.cover-icon{font-size:42px;margin-top:14px}.cover-eyebrow{margin-top:10px}.open-button{width:min(100%,420px)}}@media(max-height:760px){.opening-cover{place-items:start center}.cover-content{min-height:auto}.dual-logo-header{margin-bottom:10px}.logo-soft-card{width:102px;height:72px;padding:7px 9px}.cover-icon{font-size:36px;margin-top:8px}.cover-eyebrow{margin-top:8px}.cover-content h1{font-size:clamp(30px,5.5vw,52px);margin:8px 0}.cover-content p{font-size:14px}.open-button{min-height:54px;margin-top:14px}.sound-hint{margin-top:7px}.prepared-by{font-size:11px}}@media(max-height:620px){.opening-cover{padding-top:10px;padding-bottom:10px}.dual-logo-header{gap:7px;margin-bottom:8px}.logo-soft-card{width:88px;height:62px;border-radius:17px;padding:6px 8px}.cover-icon{display:none}.cover-eyebrow{margin-top:4px}.cover-content h1{font-size:30px}.open-button{min-height:50px}.sound-hint{font-size:10px}}`}</style>;
}
