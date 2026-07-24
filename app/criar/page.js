"use client";
import { useEffect, useState } from 'react';

export default function Criar() {
  const [mounted, setMounted] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        window.history.replaceState(null, '', '/criar');
        const res = await fetch('/api/auth/me', { method: 'GET' });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error('Sessão inválida');

        const user = data.user;
        const state = JSON.parse(localStorage.getItem('giftBuilderState') || '{}');
        localStorage.setItem('giftBuilderState', JSON.stringify({
          ...state,
          userId: user.id,
          userEmail: user.email,
          userName: user.name || user.email.split('@')[0],
          userWhatsapp: user.whatsapp || state.userWhatsapp || '',
          isAdmin: user.role === 'admin'
        }));
        setAllowed(true);
      } catch (e) {
        window.location.replace('/login');
        return;
      } finally {
        setMounted(true);
      }
    }
    check();
  }, []);

  if (!mounted || !allowed) return <main style={{minHeight:'100vh',background:'#030606'}} />;

  return (
    <iframe
      src="/eterniza/index.html?start=recipient&v=7.3.2"
      style={{ border: 0, width: '100vw', height: '100vh', display: 'block' }}
    />
  );
}
