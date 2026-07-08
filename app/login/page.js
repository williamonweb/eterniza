"use client";
import { useEffect, useState } from 'react';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverSent, setRecoverSent] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main style={{minHeight:'100vh',background:'#030606'}} />;
  }

  async function entrar(e) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Não foi possível entrar.');
      const user = data.user;
      const isAdmin = user.role === 'admin';
      const current = JSON.parse(localStorage.getItem('giftBuilderState') || '{}');
      localStorage.setItem('giftBuilderState', JSON.stringify({
        ...current,
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.email.split('@')[0],
        userWhatsapp: user.whatsapp || current.userWhatsapp || '',
        isAdmin
      }));
      window.location.replace(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao entrar.');
      setLoading(false);
    }
  }
  function abrirRecuperacao(e) {
    e.preventDefault();
    setRecoverEmail(email.trim().toLowerCase());
    setRecoverSent(false);
    setRecoverOpen(true);
  }
  function enviarRecuperacao(e) {
    e.preventDefault();
    const mail = recoverEmail.trim().toLowerCase();
    if (!mail) return;
    setRecoverEmail(mail);
    setRecoverSent(true);
  }
  return (
    <main className="auth-page">
      <style>{`
        .auth-page{min-height:100vh;background:radial-gradient(circle at 28% 10%,rgba(239,191,88,.14),transparent 25%),linear-gradient(135deg,#050706 0%,#071117 58%,#030606 100%);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:34px;box-sizing:border-box}.auth-shell{width:min(1120px,100%);display:grid;grid-template-columns:.92fr 1.08fr;border:1px solid rgba(239,189,82,.22);border-radius:34px;overflow:hidden;background:rgba(255,255,255,.035);box-shadow:0 32px 100px rgba(0,0,0,.55)}.auth-brand{padding:42px;background:linear-gradient(180deg,rgba(239,189,82,.10),rgba(0,0,0,.12));border-right:1px solid rgba(239,189,82,.16);min-height:620px;display:flex;flex-direction:column;justify-content:space-between;gap:28px}.auth-logo{display:flex;align-items:center;gap:22px;text-decoration:none;color:inherit}.auth-logo img{width:130px;height:130px;object-fit:contain;border-radius:18px}.auth-logo strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:58px;line-height:.9;color:#efbd52}.auth-logo span{display:block;color:#f1c45d;margin-top:10px;font-size:17px}.auth-brand h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(38px,4vw,58px);line-height:.96;margin:36px 0 18px;color:#fff7ea;letter-spacing:-1.8px}.auth-brand h1 em{font-style:normal;color:#e8b550}.auth-brand p{font-size:18px;line-height:1.5;color:#f4ead8;max-width:430px;margin:0 0 8px}.auth-mini{position:static;display:grid;gap:12px;margin-top:24px}.auth-mini div{border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.20);border-radius:18px;padding:15px 17px;color:#e9dfcf}.auth-card{padding:54px;display:flex;align-items:center;justify-content:center}.auth-box{width:min(500px,100%)}.auth-box h2{font-family:Georgia,'Times New Roman',serif;font-size:48px;margin:0 0 8px;color:#fff8ee}.auth-box>p{margin:0 0 28px;color:#f0d69c;font-size:17px}.auth-field{display:block;margin:17px 0}.auth-field span{display:block;font-weight:900;margin:0 0 8px;color:#fff3d9}.auth-field input{width:100%;box-sizing:border-box;height:58px;border-radius:15px;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.075);color:#fff;font-size:17px;padding:0 17px;outline:none}.auth-field input:focus{border-color:#efbd52;box-shadow:0 0 0 4px rgba(239,189,82,.12)}.auth-row{display:flex;justify-content:space-between;gap:14px;align-items:center;margin:16px 0 24px;color:#e8dcc9}.auth-row label{display:flex;gap:9px;align-items:center}.auth-row a{color:#efbd52;text-decoration:none;font-weight:900}.auth-submit{width:100%;height:62px;border:0;border-radius:16px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#110d06;font-size:18px;font-weight:1000;cursor:pointer;box-shadow:0 18px 50px rgba(239,189,82,.20)}.auth-switch{text-align:center;margin-top:22px;color:#ddd0bd}.auth-switch a{color:#efbd52;font-weight:1000;text-decoration:none}.auth-back{display:inline-flex;margin-top:24px;color:#d6c3a3;text-decoration:none;font-weight:800}.eye-wrap{position:relative}.eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#efbd52;font-size:20px;cursor:pointer}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);z-index:50;display:flex;align-items:center;justify-content:center;padding:22px}.recover-modal{width:min(520px,100%);border:1px solid rgba(239,189,82,.28);border-radius:28px;background:linear-gradient(145deg,#101819,#050706);box-shadow:0 30px 90px rgba(0,0,0,.7);padding:30px;color:#fff;position:relative}.modal-close{position:absolute;right:18px;top:16px;width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font-size:24px;cursor:pointer}.recover-modal h3{font-family:Georgia,'Times New Roman',serif;font-size:34px;margin:0 48px 10px 0;color:#fff8ee}.recover-modal p{color:#ead9b7;line-height:1.5;margin:0 0 18px}.recover-modal .auth-field{margin-top:18px}.recover-actions{display:flex;gap:12px;margin-top:20px}.recover-actions button{flex:1;height:54px;border-radius:15px;border:1px solid rgba(239,189,82,.24);font-weight:1000;cursor:pointer}.recover-primary{background:linear-gradient(135deg,#c99337,#f7dc82);color:#120d06}.recover-secondary{background:rgba(255,255,255,.06);color:#fff}.recover-success{border:1px solid rgba(239,189,82,.28);background:rgba(239,189,82,.10);border-radius:18px;padding:18px;margin-top:18px;color:#fff3d3}.recover-success strong{display:block;color:#efbd52;margin-bottom:6px}@media(max-width:900px){.auth-shell{grid-template-columns:1fr}.auth-brand{min-height:auto;border-right:0;border-bottom:1px solid rgba(239,189,82,.16)}.auth-mini{position:static;margin-top:24px}.auth-card{padding:38px}.auth-logo img{width:94px;height:94px}.auth-logo strong{font-size:43px}.auth-brand h1{font-size:46px;margin-top:38px}}@media(max-width:560px){.auth-page{padding:18px}.auth-brand,.auth-card{padding:26px}.auth-logo{gap:14px}.auth-logo img{width:76px;height:76px}.auth-logo strong{font-size:35px}.auth-logo span{font-size:13px}.auth-box h2{font-size:38px}.auth-row{align-items:flex-start;flex-direction:column}}
`}</style>
      <section className="auth-shell">
        <aside className="auth-brand">
          <a className="auth-logo" href="/">
            <img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza" />
            <div><strong>Eterniza</strong><span>Onde Cada História Vive Para Sempre!</span></div>
          </a>
          <h1>Entre para criar uma <em>homenagem inesquecível.</em></h1>
          <p>Acesse sua conta, continue uma homenagem ou entre no painel administrativo.</p>
          <div className="auth-mini"><div>🎬 Storytelling cinematográfico</div><div>🎵 Música, carta, fotos e momentos especiais</div><div>🔗 Link único para compartilhar</div></div>
        </aside>
        <div className="auth-card">
          <form className="auth-box" onSubmit={entrar}>
            <h2>Entrar</h2>
            <p>Acesse sua conta Eterniza.</p>
            <label className="auth-field"><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value.toLowerCase())} autoCapitalize="none" autoComplete="email" inputMode="email" spellCheck="false" placeholder="seuemail@gmail.com" required /></label>
            <label className="auth-field"><span>Senha</span><div className="eye-wrap"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="sua senha" required onKeyDown={e=>{ if(e.key==='Enter') entrar(e); }} /><button type="button" className="eye-btn" onClick={()=>setShow(!show)}>{show?'🙈':'👁️'}</button></div></label>
            <div className="auth-row"><label><input type="checkbox" defaultChecked /> Permanecer conectado</label><a href="#" onClick={abrirRecuperacao}>Esqueci minha senha</a></div>
            {error && <div style={{border:'1px solid rgba(255,90,90,.35)',background:'rgba(255,90,90,.10)',color:'#ffd0d0',padding:'12px 14px',borderRadius:14,marginBottom:14,fontWeight:800}}>{error}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar agora'}</button>
            <p className="auth-switch">Ainda não tem conta? <a href="/cadastro">Criar minha homenagem</a></p>
            <a className="auth-back" href="/">← Voltar para a página inicial</a>
          </form>
        </div>
      </section>

      {recoverOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Recuperar senha">
          <form className="recover-modal" onSubmit={enviarRecuperacao}>
            <button type="button" className="modal-close" onClick={()=>setRecoverOpen(false)} aria-label="Fechar">×</button>
            <h3>Recuperar senha</h3>
            {!recoverSent ? (
              <>
                <p>Informe o e-mail cadastrado na Eterniza. Vamos preparar o envio das instruções para redefinir sua senha.</p>
                <label className="auth-field"><span>E-mail da conta</span><input type="email" value={recoverEmail} onChange={e=>setRecoverEmail(e.target.value.toLowerCase())} autoCapitalize="none" autoComplete="email" inputMode="email" spellCheck="false" placeholder="seuemail@gmail.com" required /></label>
                <div className="recover-actions">
                  <button type="button" className="recover-secondary" onClick={()=>setRecoverOpen(false)}>Cancelar</button>
                  <button type="submit" className="recover-primary">Enviar recuperação</button>
                </div>
              </>
            ) : (
              <>
                <div className="recover-success"><strong>Solicitação registrada.</strong>Se este e-mail estiver cadastrado, as instruções de recuperação serão enviadas para {recoverEmail}.</div>
                <div className="recover-actions">
                  <button type="button" className="recover-primary" onClick={()=>setRecoverOpen(false)}>Entendi</button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </main>
  );
}
