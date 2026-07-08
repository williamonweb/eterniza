"use client";
import { useEffect, useState } from 'react';

export default function Cadastro() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main style={{minHeight:'100vh',background:'#030606'}} />;
  }

  async function criar(e) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: mail, whatsapp, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Não foi possível criar a conta.');
      const user = data.user;
      const current = JSON.parse(localStorage.getItem('giftBuilderState') || '{}');
      localStorage.setItem('giftBuilderState', JSON.stringify({
        ...current,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userWhatsapp: user.whatsapp || '',
        isAdmin: false
      }));
      window.location.replace('/criar');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
      <style>{`
        .auth-page{min-height:100vh;background:radial-gradient(circle at 28% 10%,rgba(239,191,88,.14),transparent 25%),linear-gradient(135deg,#050706 0%,#071117 58%,#030606 100%);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:34px;box-sizing:border-box}.auth-shell{width:min(1120px,100%);display:grid;grid-template-columns:.92fr 1.08fr;border:1px solid rgba(239,189,82,.22);border-radius:34px;overflow:hidden;background:rgba(255,255,255,.035);box-shadow:0 32px 100px rgba(0,0,0,.55)}.auth-brand{padding:42px;background:linear-gradient(180deg,rgba(239,189,82,.10),rgba(0,0,0,.12));border-right:1px solid rgba(239,189,82,.16);min-height:620px;display:flex;flex-direction:column;justify-content:space-between;gap:28px}.auth-logo{display:flex;align-items:center;gap:22px;text-decoration:none;color:inherit}.auth-logo img{width:130px;height:130px;object-fit:contain;border-radius:18px}.auth-logo strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:58px;line-height:.9;color:#efbd52}.auth-logo span{display:block;color:#f1c45d;margin-top:10px;font-size:17px}.auth-brand h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(38px,4vw,58px);line-height:.96;margin:36px 0 18px;color:#fff7ea;letter-spacing:-1.8px}.auth-brand h1 em{font-style:normal;color:#e8b550}.auth-brand p{font-size:18px;line-height:1.5;color:#f4ead8;max-width:430px;margin:0 0 8px}.auth-mini{position:static;display:grid;gap:12px;margin-top:24px}.auth-mini div{border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.20);border-radius:18px;padding:15px 17px;color:#e9dfcf}.auth-card{padding:54px;display:flex;align-items:center;justify-content:center}.auth-box{width:min(500px,100%)}.auth-box h2{font-family:Georgia,'Times New Roman',serif;font-size:48px;margin:0 0 8px;color:#fff8ee}.auth-box>p{margin:0 0 28px;color:#f0d69c;font-size:17px}.auth-field{display:block;margin:17px 0}.auth-field span{display:block;font-weight:900;margin:0 0 8px;color:#fff3d9}.auth-field input{width:100%;box-sizing:border-box;height:58px;border-radius:15px;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.075);color:#fff;font-size:17px;padding:0 17px;outline:none}.auth-field input:focus{border-color:#efbd52;box-shadow:0 0 0 4px rgba(239,189,82,.12)}.auth-row{display:flex;justify-content:space-between;gap:14px;align-items:center;margin:16px 0 24px;color:#e8dcc9}.auth-row label{display:flex;gap:9px;align-items:center}.auth-row a{color:#efbd52;text-decoration:none;font-weight:900}.auth-submit{width:100%;height:62px;border:0;border-radius:16px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#110d06;font-size:18px;font-weight:1000;cursor:pointer;box-shadow:0 18px 50px rgba(239,189,82,.20)}.auth-switch{text-align:center;margin-top:22px;color:#ddd0bd}.auth-switch a{color:#efbd52;font-weight:1000;text-decoration:none}.auth-back{display:inline-flex;margin-top:24px;color:#d6c3a3;text-decoration:none;font-weight:800}.eye-wrap{position:relative}.eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#efbd52;font-size:20px;cursor:pointer}@media(max-width:900px){.auth-shell{grid-template-columns:1fr}.auth-brand{min-height:auto;border-right:0;border-bottom:1px solid rgba(239,189,82,.16)}.auth-mini{position:static;margin-top:24px}.auth-card{padding:38px}.auth-logo img{width:94px;height:94px}.auth-logo strong{font-size:43px}.auth-brand h1{font-size:46px;margin-top:38px}}@media(max-width:560px){.auth-page{padding:18px}.auth-brand,.auth-card{padding:26px}.auth-logo{gap:14px}.auth-logo img{width:76px;height:76px}.auth-logo strong{font-size:35px}.auth-logo span{font-size:13px}.auth-box h2{font-size:38px}.auth-row{align-items:flex-start;flex-direction:column}}
`}</style>
      <section className="auth-shell">
        <aside className="auth-brand">
          <a className="auth-logo" href="/">
            <img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza" />
            <div><strong>Eterniza</strong><span>Onde Cada História Vive Para Sempre!</span></div>
          </a>
          <h1>Comece sua primeira <em>experiência Eterniza.</em></h1>
          <p>Crie sua conta para montar homenagens com fotos, música, carta, QR Code e link exclusivo.</p>
          <div className="auth-mini"><div>❤️ Ideal para amor, mãe, pai, filhos e amigos</div><div>🎁 Pronto para vender como presente digital</div><div>✨ Experiência premium em poucos minutos</div></div>
        </aside>
        <div className="auth-card">
          <form className="auth-box" onSubmit={criar}>
            <h2>Criar conta</h2>
            <p>Cadastre-se para iniciar sua homenagem.</p>
            <label className="auth-field"><span>Nome completo</span><input type="text" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Seu nome" required /></label>
            <label className="auth-field"><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value.toLowerCase())} autoCapitalize="none" autoComplete="email" inputMode="email" spellCheck="false" placeholder="seuemail@gmail.com" required /></label>
            <label className="auth-field"><span>WhatsApp</span><input type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999" /></label>
            <label className="auth-field"><span>Senha</span><div className="eye-wrap"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="crie uma senha" required /><button type="button" className="eye-btn" onClick={()=>setShow(!show)}>{show?'🙈':'👁️'}</button></div></label>
            <label className="auth-field"><span>Confirmar senha</span><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="repita a senha" required /></label>
            <div className="auth-row"><label><input type="checkbox" required /> Concordo com os termos</label></div>
            {error && <div style={{border:'1px solid rgba(255,90,90,.35)',background:'rgba(255,90,90,.10)',color:'#ffd0d0',padding:'12px 14px',borderRadius:14,marginBottom:14,fontWeight:800}}>{error}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar minha conta'}</button>
            <p className="auth-switch">Já possui conta? <a href="/login">Entrar</a></p>
            <a className="auth-back" href="/">← Voltar para a página inicial</a>
          </form>
        </div>
      </section>
    </main>
  );
}
