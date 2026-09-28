'use client';
import { useEffect, useState } from 'react';
import './admin-install.css';

export default function AdminInstall() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' }).catch(() => {});
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setInstalled(standalone);
    function ready(event) { event.preventDefault(); setPrompt(event); }
    function done() { setInstalled(true); setPrompt(null); }
    window.addEventListener('beforeinstallprompt', ready);
    window.addEventListener('appinstalled', done);
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', done); };
  }, []);
  if (installed || !prompt) return null;
  async function install() {
    const deferred = prompt;
    setPrompt(null);
    await deferred.prompt();
    const result = await deferred.userChoice;
    if (result.outcome !== 'accepted') setPrompt(deferred);
  }
  return <button type="button" className="admin-install-button" onClick={install} aria-label="Instalar o painel Eterniza no Android">↓ Instalar app</button>;
}
