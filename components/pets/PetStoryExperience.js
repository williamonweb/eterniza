"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TYPE_CONTENT = {
  FAREWELL:{icon:"🌈",eyebrow:"Uma homenagem de amor",intro:["Alguns encontros mudam a nossa vida.","Algumas histórias permanecem para sempre."]},
  SURGERY:{icon:"🩺",eyebrow:"Uma etapa vencida",intro:["Coragem também pode ter quatro patas.","Hoje celebramos cuidado, força e esperança."]},
  RECOVERY:{icon:"❤️",eyebrow:"Celebrando a recuperação",intro:["Cada pequeno avanço merece ser lembrado.","Esta é uma história de força e carinho."]},
  DISCHARGE:{icon:"🏥",eyebrow:"Hora de voltar para casa",intro:["Depois de tanto cuidado, chegou o grande momento.","O melhor lugar do mundo está esperando."]},
  BIRTHDAY:{icon:"🎂",eyebrow:"Um dia muito especial",intro:["Há vidas que tornam todos os dias mais felizes.","Hoje celebramos mais um capítulo dessa história."]},
  ADOPTION:{icon:"🏠",eyebrow:"O começo de uma nova história",intro:["Às vezes, uma família só estava esperando se encontrar.","Hoje começa uma história para a vida inteira."]},
  VACCINATION:{icon:"💉",eyebrow:"Cuidado que também é amor",intro:["Amar também é proteger.","Cada cuidado constrói muitos momentos felizes."]},
  CUSTOM:{icon:"✨",eyebrow:"Um momento para sempre",intro:["Alguns momentos merecem um lugar especial.","Esta história foi preparada com muito carinho."]},
};

const DEFAULT_ONDA_LOGO = "/eterniza/assets/pets/brands/logo-onda-transparente.png";
const ETERNIZA_LOGO = "/eterniza/assets/pets/brands/logo-eterniza-transparente.png";

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
  const typeContent=useMemo(()=>TYPE_CONTENT[data.type]||TYPE_CONTENT.CUSTOM,[data.type]);
  const messageParagraphs=paragraphs(data.message);
  const accent=data.themeColor||clinic.primaryColor||"#277ed4";
  const ytId=youtubeId(data.musicUrl);
  const clinicLogo=clinic.logoUrl||DEFAULT_ONDA_LOGO;

  useEffect(()=>{
    if(!opened)return;
    const timers=[
      setTimeout(()=>setIntroStep(1),450),
      setTimeout(()=>setIntroStep(2),2850),
      setTimeout(()=>setIntroStep(3),5250),
      setTimeout(()=>{
        setStoryVisible(true);
        setTimeout(()=>storyRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
      },7600),
    ];
    return()=>timers.forEach(clearTimeout);
  },[opened]);

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
              <img src={clinicLogo} alt={clinic.tradeName||"Clínica"}/>
              <span>×</span>
              <img src={ETERNIZA_LOGO} alt="Eterniza"/>
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
          <div className={`intro-scene ${introStep===1?"active":""}`}><span>{typeContent.icon}</span><h2>{typeContent.intro[0]}</h2></div>
          <div className={`intro-scene ${introStep===2?"active":""}`}><h2>{typeContent.intro[1]}</h2></div>
          <div className={`intro-scene pet-reveal ${introStep===3?"active":""}`}><small>Esta história é sobre</small><h2>{data.petName}</h2></div>
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
          <h2>algumas histórias são sentidas muito antes de serem contadas.</h2>
        </section>

        {photos.length>1&&(
          <section className="photo-chapters">
            {photos.slice(1).map((photo,index)=>(
              <article className={`photo-chapter ${index%2?"reverse":""}`} key={`${photo.name||"foto"}-${index}`}>
                <div className="chapter-photo-card">
                  <img src={photo.dataUrl||photo} alt={`${data.petName} ${index+2}`}/>
                  <span>{String(index+1).padStart(2,"0")}</span>
                </div>
                <div className="chapter-copy"><small>Capítulo {String(index+1).padStart(2,"0")}</small><h2>{chapterTitle(data.type,index)}</h2><p>{chapterText(data.petName,index)}</p></div>
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
          <h2>Que esta história continue vivendo em cada lembrança.</h2>
          <p>Esta experiência pode ser aberta novamente sempre que o coração pedir.</p>
          <div className="final-actions">
            <button onClick={shareExperience}>Compartilhar</button>
            <button className="secondary" onClick={copyLink}>Copiar link</button>
            {data.musicUrl&&<button className="secondary" onClick={toggleMusic}>{musicPlaying?"Pausar música":"Tocar música"}</button>}
          </div>
          {shareFeedback&&<div className="share-feedback">{shareFeedback}</div>}
        </section>

        <footer className="powered-footer">
          <div className="footer-logos">
            <img src={clinicLogo} alt={clinic.tradeName||"Clínica"}/>
            <span>em parceria com</span>
            <img src={ETERNIZA_LOGO} alt="Eterniza"/>
          </div>
          {!preview&&clinic.showEternizaCta!==false&&<a href={clinic.eternizaCtaUrl||"https://eternizas.com.br"}>{clinic.eternizaCtaText||"Conheça o Eterniza"}</a>}
        </footer>

        {data.musicUrl&&<button className="floating-music" onClick={toggleMusic}>{musicPlaying?"♫":"▶"}</button>}
      </section>
    </main>
  );
}

function chapterTitle(type,index) {
  const titles={
    FAREWELL:["Um amor que permanece","Cada lembrança importa","Para sempre perto"],
    SURGERY:["Coragem em cada passo","Cuidado que acolhe","Uma nova etapa"],
    RECOVERY:["Pequenas grandes vitórias","Força todos os dias","Juntos novamente"],
    DISCHARGE:["O caminho de volta","Casa, carinho e descanso","Um novo começo"],
    BIRTHDAY:["Mais um ano de alegria","Momentos que viram memória","Uma vida muito amada"],
    ADOPTION:["O primeiro encontro","Quando a família ficou completa","Uma vida inteira pela frente"],
    VACCINATION:["Cuidar é proteger","Amor em cada detalhe","Muitos anos pela frente"],
    CUSTOM:["Um momento especial","Memórias que aquecem","Uma história única"],
  };
  const list=titles[type]||titles.CUSTOM;
  return list[index%list.length];
}
function chapterText(petName,index) {
  const texts=[`${petName} transformou momentos simples em lembranças inesquecíveis.`,"Porque o amor verdadeiro também mora nos pequenos gestos, nos olhares e na presença.","E cada fotografia guarda um pedaço de uma história que merece continuar viva."];
  return texts[index%texts.length];
}

function Style() {
  return <style>{`
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}.pet-story{min-height:100vh;background:#02070b;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;overflow:hidden}.preview-mode{position:fixed;inset:0;z-index:200;overflow:auto}.preview-toolbar{position:fixed;left:0;right:0;top:0;z-index:300;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:rgba(2,7,11,.94);border-bottom:1px solid rgba(255,255,255,.1)}.preview-toolbar strong,.preview-toolbar span{display:block}.preview-toolbar span{color:#8fa4b1;font-size:11px}.preview-toolbar button{min-height:40px;padding:0 15px;border:1px solid rgba(255,255,255,.15);border-radius:11px;background:rgba(255,255,255,.06);color:#fff}.preview-mode .opening-cover,.preview-mode .cinematic-intro{top:65px}.youtube-audio-frame{position:fixed;left:-9999px;top:-9999px;width:2px;height:2px;opacity:.01;pointer-events:none}.opening-cover,.cinematic-intro{position:fixed;inset:0;z-index:50;display:grid;place-items:center;text-align:center;padding:24px;background:radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 34%),linear-gradient(180deg,#06131d,#02070b)}.cover-glow,.hero-glow{position:absolute;width:min(70vw,760px);height:min(70vw,760px);border-radius:50%;background:color-mix(in srgb,var(--accent) 14%,transparent);filter:blur(90px)}.cover-content{position:relative;z-index:2;width:min(760px,100%)}.dual-logo-header{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:12px}.dual-logo-header img{width:120px;height:86px;object-fit:contain}.dual-logo-header img:last-child{width:135px}.dual-logo-header span{color:#77909f;font-size:20px}.prepared-by{color:#8fa5b2}.cover-icon{font-size:52px;margin-top:24px}.cover-eyebrow{display:block;color:#90d2ff;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.12em;margin-top:16px}.cover-content h1{font:700 clamp(45px,7vw,78px)/.98 Georgia,serif;margin:16px 0}.cover-content p{color:#a9bdc9;font-size:18px}.open-button{display:inline-flex;align-items:center;gap:12px;min-height:62px;margin-top:24px;padding:0 28px;border:0;border-radius:17px;background:linear-gradient(135deg,var(--accent),#a9ddff);color:#03101a;font-weight:1000}.open-button span{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.35)}.sound-hint{display:block;color:#738b9a;margin-top:14px}.cinematic-intro{z-index:45}.intro-scene{position:absolute;width:min(900px,88vw);opacity:0;transform:translateY(20px);transition:.8s;pointer-events:none}.intro-scene.active{opacity:1;transform:none}.intro-scene small{display:block;color:#85cdfd;text-transform:uppercase}.intro-scene span{font-size:60px}.intro-scene h2{font:700 clamp(40px,7vw,78px)/1.06 Georgia,serif}.pet-reveal h2{font-size:clamp(70px,13vw,155px)}.skip-button{position:absolute;right:24px;bottom:24px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.05);color:#aebfca;border-radius:12px;padding:11px 16px}.story{display:none;opacity:0}.story.visible{display:block;opacity:1}.story-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 24px 70px;overflow:hidden}.story-hero-copy{position:relative;z-index:2;text-align:center}.story-hero-copy span{color:#9dd8ff;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}.story-hero-copy h1{font:700 clamp(64px,12vw,145px)/.82 Georgia,serif;margin:24px 0}.story-hero-copy p{color:#b6c8d3;font-size:20px}.hero-photo-card{position:relative;z-index:2;width:min(720px,92vw);margin-top:32px;padding:18px 18px 56px;border-radius:31px;background:linear-gradient(145deg,#fffaf1,#e9dfcf);box-shadow:0 40px 120px rgba(0,0,0,.52);transform:rotate(-1.2deg)}.hero-photo-card img,.photo-placeholder{width:100%;height:min(62vh,610px);object-fit:cover;border-radius:20px;background:#dfe7ec;display:grid;place-items:center;font-size:80px}.hero-photo-card i{position:absolute;left:50%;top:-17px;width:115px;height:35px;transform:translateX(-50%) rotate(2deg);background:rgba(235,218,178,.78);box-shadow:0 5px 12px rgba(0,0,0,.12)}.hero-photo-card b{position:absolute;left:0;right:0;bottom:17px;text-align:center;color:#29333b;font:700 28px "Segoe Print",Georgia,serif}.continue-story{position:relative;z-index:2;margin-top:45px;padding:14px 20px;border:1px solid rgba(255,255,255,.2);border-radius:14px;background:rgba(255,255,255,.05);color:#fff}.emotion-scene{min-height:75vh;display:grid;place-content:center;text-align:center;padding:70px 24px}.emotion-scene h2{width:min(1000px,90vw);font:700 clamp(44px,7vw,86px)/1.08 Georgia,serif}.photo-chapters{width:min(1120px,100%);margin:auto;padding:50px 24px}.photo-chapter{min-height:70vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:70px}.photo-chapter.reverse .chapter-photo-card{order:2}.chapter-photo-card{position:relative;padding:15px 15px 48px;border-radius:27px;background:#fffaf1;box-shadow:0 35px 95px rgba(0,0,0,.45);transform:rotate(1.3deg)}.photo-chapter.reverse .chapter-photo-card{transform:rotate(-1.3deg)}.chapter-photo-card img{width:100%;height:min(62vh,560px);object-fit:cover;border-radius:17px}.chapter-photo-card span{position:absolute;right:22px;bottom:14px;color:#35434c;font:700 24px Georgia,serif}.chapter-copy h2{font:700 clamp(42px,5vw,72px)/1 Georgia,serif}.chapter-copy p{color:#aebfca;font-size:19px;line-height:1.7}.letter-scene{min-height:100vh;display:grid;place-items:center;padding:90px 24px}.letter-card{position:relative;width:min(860px,100%);padding:65px clamp(28px,7vw,75px);border-radius:32px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}.letter-mark{position:absolute;right:35px;top:20px;font:700 120px Georgia,serif;color:color-mix(in srgb,var(--accent) 24%,transparent)}.letter-card h2{font:700 clamp(36px,5vw,58px) Georgia,serif}.letter-content p{opacity:0;transform:translateY(16px);white-space:pre-wrap;color:#d6e0e6;font:400 clamp(18px,2vw,22px)/1.9 Georgia,serif;animation:letterIn .8s ease forwards;animation-delay:var(--delay)}.clinic-signature{margin-top:42px;padding-top:25px;border-top:1px solid rgba(255,255,255,.1)}.final-scene{min-height:80vh;display:grid;place-content:center;text-align:center;padding:80px 24px}.final-scene h2{width:min(950px,92vw);font:700 clamp(45px,7vw,82px)/1.05 Georgia,serif}.final-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.final-actions button{min-height:53px;padding:0 22px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--accent),#9fd9ff);font-weight:1000}.final-actions button.secondary{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff}.share-feedback{color:#8ee2b3;margin-top:14px}.powered-footer{display:flex;flex-direction:column;align-items:center;gap:20px;padding:45px 24px;border-top:1px solid rgba(255,255,255,.08)}.footer-logos{display:flex;align-items:center;justify-content:center;gap:18px}.footer-logos img{width:118px;height:75px;object-fit:contain}.footer-logos img:last-child{width:135px}.footer-logos span{color:#718895;font-size:11px;text-transform:uppercase}.powered-footer>a{color:#9ed8ff;font-weight:900;text-decoration:none}.floating-music{position:fixed;right:22px;bottom:22px;z-index:80;width:56px;height:56px;border:0;border-radius:50%;background:var(--accent);color:#04111b;font-size:22px}@keyframes letterIn{to{opacity:1;transform:none}}@media(max-width:820px){.photo-chapter{grid-template-columns:1fr;gap:35px}.photo-chapter.reverse .chapter-photo-card{order:0}.dual-logo-header img{width:95px}.dual-logo-header img:last-child{width:110px}.footer-logos{flex-wrap:wrap}.footer-logos span{width:100%;text-align:center}.hero-photo-card{padding:12px 12px 48px}.hero-photo-card img,.photo-placeholder{height:52vh}}`}</style>;
}
