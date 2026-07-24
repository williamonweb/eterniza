"use client";
import { useEffect, useState } from "react";
import { StudioProvider, useStudio } from "./StudioContext";
import StudioSidebar from "./StudioSidebar";
import StudioPreview from "./StudioPreview";
import "./studio.css";

export default function StudioApp() {
  const [ready, setReady] = useState(false);
  const [seed, setSeed] = useState(null);
  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me", { cache: "no-store" }).then(r => r.json()).catch(() => null);
      if (!me?.ok) { window.location.replace("/login"); return; }
      let stored = {};
      try { stored = JSON.parse(localStorage.getItem("giftBuilderState") || "{}"); } catch {}
      setSeed({ ...stored, senderName: stored.senderName || me.user?.name || "", userId: me.user?.id, userEmail: me.user?.email });
      setReady(true);
    })();
  }, []);
  if (!ready) return <main className="studio-loading">Preparando seu Studio...</main>;
  return <StudioProvider seed={seed}><StudioWorkspace /></StudioProvider>;
}

function StudioWorkspace() {
  const { state, patch } = useStudio();
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => { fetch("/api/plans").then(r => r.json()).then(data => { if (data?.ok) { setPlans(data.plans || []); if (!state.plan && data.plans?.[0]) patch({ plan: data.plans[0] }); } }); }, []);

  async function save() {
    if (!state.receiverName.trim()) return setModal({ title:"Falta o nome", text:"Informe para quem é a homenagem antes de salvar." });
    if (!state.plan?.slug) return setModal({ title:"Escolha um plano", text:"Selecione o plano da homenagem no menu lateral." });
    setSaving(true);
    try {
      const content = { ...state, recipient: { id: state.category || state.themeId }, studio: { version:"7.3", themeId:state.themeId, accentColor:state.accentColor, background:state.background, fontFamily:state.fontFamily, effect:state.effect } };
      const response = await fetch("/api/tributes/draft", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tributeId:state.tributeId, content }) });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Não foi possível salvar.");
      patch({ tributeId:data.tribute.id, slug:data.tribute.slug, publicUrl:data.tribute.public_url });
      localStorage.setItem("giftBuilderState", JSON.stringify({ ...content, tributeId:data.tribute.id, slug:data.tribute.slug, publicUrl:data.tribute.public_url }));
      setModal({ title:"Rascunho salvo", text:"Sua homenagem foi salva com segurança.", action:"dashboard" });
    } catch (error) { setModal({ title:"Não foi possível salvar", text:error.message }); }
    finally { setSaving(false); }
  }

  return <main className="studio-root">
    <header className="studio-topbar"><a href="/dashboard" className="studio-brand"><img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza"/><div><strong>Eterniza Studio</strong><span>Editor visual</span></div></a><div className="studio-status"><i/> Alterações locais</div><div className="studio-actions"><a href="/criar-classico">Editor clássico</a><button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar rascunho"}</button></div></header>
    <div className="studio-workspace"><StudioSidebar plans={plans}/><section className="studio-canvas"><div className="studio-canvas-head"><div><span>Pré-visualização ao vivo</span><strong>{state.receiverName || "Nova homenagem"}</strong></div><em>Celular</em></div><StudioPreview /></section></div>
    {modal && <div className="studio-modal-backdrop" onMouseDown={() => setModal(null)}><div className="studio-modal" onMouseDown={e => e.stopPropagation()}><span>ETERNIZA</span><h3>{modal.title}</h3><p>{modal.text}</p><div>{modal.action === "dashboard" && <button className="secondary" onClick={() => window.location.href="/dashboard"}>Ir ao painel</button>}<button onClick={() => setModal(null)}>Continuar editando</button></div></div></div>}
  </main>;
}
