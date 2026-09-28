'use client';
import { useEffect, useRef, useState } from 'react';
import './home-popup.css';

export default function HomePopup({ settings }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const active = settings?.homePopupEnabled && (settings.homePopupTitle?.trim() || settings.homePopupText?.trim() || settings.homePopupImageUrl?.trim());
  useEffect(() => {
    if (!active) return;
    const key = 'eterniza:home-popup:' + JSON.stringify([settings.homePopupTitle, settings.homePopupText, settings.homePopupImageUrl, settings.homePopupButtonUrl]);
    try { if (sessionStorage.getItem(key)) return; } catch {}
    setOpen(true);
  }, [active, settings?.homePopupTitle, settings?.homePopupText, settings?.homePopupImageUrl, settings?.homePopupButtonUrl]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    function onKey(event) { if (event.key === 'Escape') dismiss(); }
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [open]);
  function dismiss() {
    const key = 'eterniza:home-popup:' + JSON.stringify([settings.homePopupTitle, settings.homePopupText, settings.homePopupImageUrl, settings.homePopupButtonUrl]);
    try { sessionStorage.setItem(key, '1'); } catch {}
    setOpen(false);
  }
  if (!active || !open) return null;
  const link = settings.homePopupButtonUrl;
  const safeLink = typeof link === 'string' && ((link.startsWith('/') && !link.startsWith('//') && !link.includes('\\')) || /^https:\/\//i.test(link)) ? link : null;
  return <div className="home-popup-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <section className="home-popup" role="dialog" aria-modal="true" aria-label={settings.homePopupTitle || 'Aviso Eterniza'}>
      <button ref={closeRef} type="button" className="home-popup-close" onClick={dismiss} aria-label="Fechar aviso">×</button>
      {settings.homePopupImageUrl && <img className="home-popup-image" src={settings.homePopupImageUrl} alt={settings.homePopupTitle || 'Imagem do aviso Eterniza'} />}
      {(settings.homePopupTitle || settings.homePopupText || (safeLink && settings.homePopupButtonText)) && <div className="home-popup-content">
        {settings.homePopupTitle && <h2>{settings.homePopupTitle}</h2>}
        {settings.homePopupText && <p>{settings.homePopupText}</p>}
        {safeLink && settings.homePopupButtonText && <a className="normal-button" href={safeLink} onClick={dismiss}>{settings.homePopupButtonText} →</a>}
      </div>}
    </section>
  </div>;
}
