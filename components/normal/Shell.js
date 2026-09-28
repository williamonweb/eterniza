'use client';
import { useEffect, useState } from 'react';
import './normal.css';
import './reference.css';
export default function Shell({ children, compact = false, minimal = false, storyWide = false }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (minimal) return;
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => {
      if (active) setUser(data?.ok ? data.user : null);
    }).catch(() => {});
    return () => { active = false; };
  }, [minimal]);
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Não foi possível sair da conta.');
      window.location.replace('/');
    } catch { window.alert('Não foi possível sair da conta. Tente novamente.'); }
  }
  return <div className="normal-site"><header className="normal-header"><a href="/" className="normal-logo" aria-label="Eterniza — início"><span className="normal-symbol" aria-hidden="true"/><span className="normal-wordmark" aria-hidden="true"/></a>{!minimal&&<><nav aria-label="Navegação principal"><a href="/como-funciona">Como funciona</a><a href="/planos">Planos</a><a href="/minhas-paginas">Minhas páginas</a>{user?<><a href="/minha-conta">Minha conta</a><button type="button" className="normal-logout" onClick={logout}>Sair</button></>:<a href="/login">Entrar</a>}</nav><div className="normal-header-actions">{user?<><a className="normal-header-cta" href="/minhas-paginas">Minhas páginas <span aria-hidden="true">↗</span></a><button type="button" className="normal-mobile-logout" onClick={logout}>Sair</button></>:<a className="normal-header-cta" href="/criar">Criar página <span aria-hidden="true">↗</span></a>}</div></>}</header><main className={`normal-main${compact?' narrow':''}${storyWide?' story-wide':''}`}>{children}</main><footer className="normal-footer"><span>❧ Eterniza</span><span>Pessoas · histórias · momentos · sempre</span><a href="/pets">Eterniza Pets para clínicas ↗</a></footer></div>;
}
