"use client";
import { useStudio } from "./StudioContext";

export default function StudioPreview() {
  const { state } = useStudio();
  const photo = state.photos?.[0];
  return (
    <div className="studio-device" style={{ "--studio-accent": state.accentColor, fontFamily: state.fontFamily }}>
      <div className="studio-screen" style={{ background: state.background }}>
        <div className={`studio-effect effect-${state.effect || "none"}`} aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}
        </div>
        <div className="studio-preview-content">
          <span className="studio-preview-kicker">Uma história eternizada</span>
          <h2>{state.receiverName || "Para alguém especial"}</h2>
          {photo ? <img className="studio-hero-photo" src={photo} alt="Prévia da homenagem" /> : <div className="studio-photo-placeholder">Sua foto principal aparecerá aqui</div>}
          <p>{state.letterText || "Escreva uma mensagem cheia de significado para visualizar a homenagem em tempo real."}</p>
          <div className="studio-signature">Com carinho, <strong>{state.senderName || "você"}</strong></div>
          {state.specialDate && <time>{new Date(`${state.specialDate}T12:00:00`).toLocaleDateString("pt-BR")}</time>}
        </div>
      </div>
    </div>
  );
}
