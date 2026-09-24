import './normal.css';
import './reference.css';
export default function Shell({ children, compact = false, minimal = false, storyWide = false }) {
  return <div className="normal-site"><header className="normal-header"><a href="/" className="normal-logo" aria-label="Eterniza — início"><span className="normal-symbol" aria-hidden="true"/><span className="normal-wordmark" aria-hidden="true"/></a>{!minimal&&<><nav aria-label="Navegação principal"><a href="/como-funciona">Como funciona</a><a href="/planos">Planos</a><a href="/minhas-paginas">Minhas páginas</a><a href="/login">Entrar</a></nav><a className="normal-header-cta" href="/criar">Criar página <span aria-hidden="true">↗</span></a></>}</header><main className={`normal-main${compact?' narrow':''}${storyWide?' story-wide':''}`}>{children}</main><footer className="normal-footer"><span>❧ Eterniza</span><span>Pessoas · histórias · momentos · sempre</span><a href="/pets">Eterniza Pets para clínicas ↗</a></footer></div>;
}
