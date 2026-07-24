"use client";
import { useRef, useState } from "react";
import { THEMES, useStudio } from "./StudioContext";

const tools = [
  ["historia", "✍", "História"], ["tema", "◈", "Tema"], ["fotos", "▧", "Fotos"],
  ["musica", "♫", "Música"], ["efeitos", "✦", "Efeitos"], ["plano", "♛", "Plano"],
];

export default function StudioSidebar({ plans }) {
  const { state, patch } = useStudio();
  const [active, setActive] = useState("historia");
  const fileRef = useRef(null);

  function chooseTheme(id) {
    const theme = THEMES[id];
    patch({ themeId: id, category: id, accentColor: theme.accent, background: theme.bg, fontFamily: theme.font });
  }

  async function addPhotos(event) {
    const files = Array.from(event.target.files || []).slice(0, 10);
    const encoded = await Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file);
    })));
    patch({ photos: [...(state.photos || []), ...encoded].slice(0, Number(state.plan?.photos || 10)) });
    event.target.value = "";
  }

  return <aside className="studio-sidebar">
    <nav className="studio-toolrail">
      {tools.map(([id, icon, label]) => <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}><span>{icon}</span>{label}</button>)}
    </nav>
    <section className="studio-panel">
      {active === "historia" && <>
        <PanelTitle title="Conte a sua história" subtitle="Cada alteração aparece na prévia." />
        <Field label="Para quem é?"><input value={state.receiverName} onChange={(e) => patch({ receiverName: e.target.value })} placeholder="Nome da pessoa" /></Field>
        <Field label="De quem?"><input value={state.senderName} onChange={(e) => patch({ senderName: e.target.value })} placeholder="Seu nome" /></Field>
        <Field label="Data especial"><input type="date" value={state.specialDate || ""} onChange={(e) => patch({ specialDate: e.target.value })} /></Field>
        <Field label="Sua mensagem"><textarea rows="9" maxLength="3500" value={state.letterText} onChange={(e) => patch({ letterText: e.target.value })} placeholder="Escreva aqui tudo o que deseja eternizar..." /><small>{state.letterText.length}/3500</small></Field>
      </>}
      {active === "tema" && <>
        <PanelTitle title="Escolha o clima" subtitle="Cores e tipografia combinadas." />
        <div className="theme-grid">{Object.entries(THEMES).map(([id, theme]) => <button key={id} className={state.themeId === id ? "selected" : ""} onClick={() => chooseTheme(id)} style={{ background: theme.bg }}><i style={{ background: theme.accent }} /> <span>{theme.name}</span></button>)}</div>
        <Field label="Cor de destaque"><input type="color" value={state.accentColor} onChange={(e) => patch({ accentColor: e.target.value })} /></Field>
        <Field label="Fonte"><select value={state.fontFamily} onChange={(e) => patch({ fontFamily: e.target.value })}><option>Georgia</option><option>Arial</option><option>Trebuchet MS</option><option>Times New Roman</option></select></Field>
      </>}
      {active === "fotos" && <>
        <PanelTitle title="Suas melhores memórias" subtitle={`Até ${state.plan?.photos || 10} fotos neste plano.`} />
        <button className="studio-upload" onClick={() => fileRef.current?.click()}>＋ Adicionar fotos</button>
        <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={addPhotos} />
        <div className="photo-grid">{state.photos.map((src, index) => <div key={`${src.slice?.(0, 24)}-${index}`}><img src={src} alt="" /><button onClick={() => patch({ photos: state.photos.filter((_, i) => i !== index) })}>×</button><span>{index + 1}</span></div>)}</div>
      </>}
      {active === "musica" && <>
        <PanelTitle title="Trilha sonora" subtitle="Cole um link do YouTube ou siga sem música." />
        <Field label="Link do YouTube"><input value={state.youtubeLink || ""} onChange={(e) => patch({ musicMode: "youtube", youtubeLink: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></Field>
        <button className="studio-secondary" onClick={() => patch({ musicMode: "none", youtubeLink: "", selectedTrack: null })}>Criar sem música</button>
      </>}
      {active === "efeitos" && <>
        <PanelTitle title="Movimento e emoção" subtitle="Efeitos discretos para dar vida à página." />
        <div className="effect-list">{[["none","Sem efeito"],["hearts","Corações"],["stars","Estrelas"],["petals","Pétalas"],["snow","Neve"]].map(([id,label]) => <button key={id} className={state.effect === id ? "selected" : ""} onClick={() => patch({ effect:id })}><span>{id === "none" ? "○" : "✦"}</span>{label}</button>)}</div>
      </>}
      {active === "plano" && <>
        <PanelTitle title="Plano da homenagem" subtitle="Escolha antes de salvar." />
        <div className="plan-list">{plans.map((plan) => <button key={plan.slug} className={state.plan?.slug === plan.slug ? "selected" : ""} onClick={() => patch({ plan, photos: state.photos.slice(0, Number(plan.photos || 10)) })}><div><strong>{plan.name}</strong><span>{plan.description || plan.duration}</span></div><b>{(Number(plan.priceCents || 0)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</b></button>)}</div>
      </>}
    </section>
  </aside>;
}

function PanelTitle({ title, subtitle }) { return <div className="studio-panel-title"><span>Eterniza Studio</span><h2>{title}</h2><p>{subtitle}</p></div>; }
function Field({ label, children }) { return <label className="studio-field"><span>{label}</span>{children}</label>; }
