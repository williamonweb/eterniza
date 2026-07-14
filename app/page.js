"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState({
    companyName: "Eterniza",
    slogan: "Onde Cada História Vive Para Sempre.",
    logoUrl: "/eterniza/assets/brand/logo-eterniza.png",
    landingBadge: "⭐ Experiência cinematográfica",
    landingTitleBefore: "Transforme fotos, música e palavras em uma",
    landingTitleHighlight: "homenagem inesquecível.",
    landingSubtitle: "A pessoa recebe um link, clica em abrir surpresa e vive uma experiência emocionante, com fotos, música, carta, bodas, momentos especiais e QR Code.",
    promoBannerEnabled: false,
    promoBannerText: "",
    landingShowExamples: true,
    landingShowPlans: true,
    landingShowProof: true,
  });

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/plans', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/settings', { cache: 'no-store' }).then(res => res.json()),
    ])
      .then(([plansData, settingsData]) => {
        if (plansData?.ok && Array.isArray(plansData.plans)) setPlans(plansData.plans);
        if (settingsData?.ok && settingsData.settings) {
          setSettings((current) => ({ ...current, ...settingsData.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const fallbackPlans = [
    { slug: 'essencial', name: 'Essencial', priceCents: 1990, photos: 2, duration: '1 mês', description: 'Uma homenagem simples e emocionante.' },
    { slug: 'premium', name: 'Premium', priceCents: 3990, photos: 10, duration: 'vitalício', description: 'A experiência completa mais escolhida.' },
    { slug: 'eterno', name: 'Eterno', priceCents: 6990, photos: 20, duration: 'vitalício', description: 'Para eternizar cada detalhe para sempre.' }
  ];
  const visiblePlans = plans.length ? plans : fallbackPlans;
  const money = cents => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (!mounted) return <main style={{minHeight:'100vh',background:'#030606'}} />;
  return (
    <main className="et-landing">
      <style>{`
        .et-promo-banner{max-width:1560px;margin:0 auto 12px;border:1px solid rgba(239,189,82,.32);background:linear-gradient(90deg,rgba(201,147,55,.18),rgba(247,220,130,.08));color:#ffe7a7;border-radius:12px;padding:11px 18px;text-align:center;font-weight:1000}.et-landing{min-height:100vh;background:radial-gradient(circle at 58% 14%,rgba(239,191,88,.18),transparent 23%),linear-gradient(90deg,#030606 0%,#061017 48%,#030504 100%);color:#fff;padding:28px 42px 34px;font-family:Inter,Segoe UI,Arial,sans-serif;overflow:hidden}.et-wrap{max-width:1560px;margin:0 auto}.et-nav{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:18px}.et-brand{display:flex;align-items:center;text-decoration:none;color:inherit}.et-brand img{width:230px;height:150px;object-fit:contain;filter:drop-shadow(0 0 26px rgba(239,189,82,.18))}.et-brand strong,.et-brand span{display:none}.et-menu{display:flex;gap:34px;align-items:center;padding-top:20px}.et-menu a{color:#fff;text-decoration:none;font-weight:800;opacity:.92}.et-menu a:hover{color:#efbd52}.et-actions{display:flex;gap:12px;padding-top:12px}.et-btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 25px;border-radius:12px;text-decoration:none;font-weight:1000;border:1px solid rgba(239,189,82,.42);color:#fff;background:rgba(255,255,255,.05);cursor:pointer;font-family:inherit}.et-btn.gold{background:linear-gradient(135deg,#c99337,#f5d579);color:#130f08;border:0;box-shadow:0 16px 45px rgba(239,189,82,.18)}.et-hero{display:grid;grid-template-columns:minmax(420px,570px) minmax(700px,1fr);gap:20px;align-items:stretch;position:relative}.et-copy{position:relative;z-index:4;padding-top:44px}.et-badge{display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;color:#efbd52;font-weight:1000;border:1px solid rgba(239,189,82,.34);background:rgba(255,255,255,.045);border-radius:999px;padding:10px 17px;margin-bottom:22px}.et-copy h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(56px,5vw,82px);line-height:.92;letter-spacing:-2px;margin:0 0 24px;color:#fff8ef;text-shadow:0 25px 80px rgba(0,0,0,.75)}.et-copy h1 em{font-style:normal;color:#e4ad43}.et-copy p{font-size:20px;line-height:1.5;color:#fff2df;max-width:640px;margin:0}.et-cta{display:flex;gap:18px;flex-wrap:wrap;margin-top:31px}.et-cta .et-btn{min-width:260px;height:60px;font-size:17px}.et-cta .et-btn:not(.gold){min-width:220px;background:rgba(0,0,0,.26)}.et-visual{min-height:565px;position:relative;overflow:visible}.et-visual:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,6,6,.02),rgba(2,6,6,0) 30%,rgba(2,6,6,.55) 73%,rgba(2,6,6,.86));z-index:2;pointer-events:none}.et-couple{position:absolute;left:-42px;top:-8px;width:82%;height:630px;object-fit:cover;object-position:center;filter:saturate(1.03) contrast(1.04) brightness(.96);mask-image:linear-gradient(90deg,transparent 0%,black 12%,black 84%,transparent 100%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,black 12%,black 84%,transparent 100%)}.et-demo{position:absolute;z-index:3;right:0;top:86px;width:min(410px,43%);padding:28px 28px 30px;border-radius:28px;background:rgba(2,7,8,.84);border:1px solid rgba(239,189,82,.45);box-shadow:0 30px 100px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.05);text-align:center}.et-demo h3{font-family:Georgia,'Times New Roman',serif;font-size:43px;line-height:1;margin:0 0 12px;color:#fff8ef}.et-demo p{font-size:18px;color:#f3c75d;margin:0 0 24px}.et-stack{height:190px;position:relative;display:grid;place-items:center;margin-bottom:22px;perspective:800px}.et-stack img{width:250px;height:156px;object-fit:cover;border-radius:17px;border:1px solid rgba(255,255,255,.2);position:relative;z-index:2;box-shadow:0 18px 60px rgba(0,0,0,.45)}.et-stack span{position:absolute;width:130px;height:104px;top:43px;border-radius:14px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12)}.et-stack span:nth-of-type(1){left:4px;transform:rotateY(28deg) scale(.9);opacity:.62}.et-stack span:nth-of-type(2){right:4px;transform:rotateY(-28deg) scale(.9);opacity:.62}.et-demo .et-btn{width:100%;height:62px;border-radius:999px;font-size:20px;box-sizing:border-box}.et-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:24px}.et-card{border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.36);overflow:hidden;text-decoration:none;color:#fff;min-height:244px}.et-card img{display:block;width:100%;height:128px;object-fit:cover}.et-card b{display:block;font-family:Georgia,'Times New Roman',serif;font-size:24px;margin:18px 22px 8px}.et-card span{display:block;font-size:18px;line-height:1.36;color:#eee6d8;margin:0 22px 22px}.et-proof{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);border-radius:12px;padding:16px}.et-proof div{display:flex;gap:12px;align-items:center;justify-content:center}.et-proof strong{display:block;font-size:18px}.et-proof span{display:block;color:#d5d1ca;font-size:15px;margin-top:4px}.et-plans{margin-top:26px;padding:34px;border:1px solid rgba(239,189,82,.18);border-radius:22px;background:rgba(255,255,255,.035)}.et-plans-head{text-align:center;margin-bottom:24px}.et-plans-head span{color:#efbd52;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}.et-plans-head h2{font-family:Georgia,'Times New Roman',serif;font-size:42px;margin:8px 0 0;color:#fff8ef}.et-plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.et-plan{padding:26px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.28);position:relative}.et-plan.featured{border-color:rgba(239,189,82,.58);box-shadow:0 18px 50px rgba(239,189,82,.10)}.et-plan h3{font-family:Georgia,'Times New Roman',serif;font-size:28px;margin:0 0 8px;color:#fff8ef}.et-plan-price{font-size:34px;font-weight:1000;color:#efbd52}.et-plan p{color:#e5dccd;line-height:1.45}.et-plan small{display:block;color:#f5d98f;font-weight:800;margin-top:12px}@media(max-width:1180px){.et-menu{display:none}.et-hero{grid-template-columns:1fr}.et-visual{min-height:650px}.et-couple{width:100%;height:650px;mask-image:linear-gradient(180deg,black 0%,black 76%,transparent 100%);-webkit-mask-image:linear-gradient(180deg,black 0%,black 76%,transparent 100%)}.et-demo{right:50%;transform:translateX(50%);width:min(430px,92%);top:130px}.et-cards,.et-proof{grid-template-columns:repeat(2,1fr)}.et-plan-grid{grid-template-columns:1fr}}@media(max-width:720px){.et-landing{padding:18px}.et-nav{align-items:flex-start}.et-brand img{width:166px;height:108px}.et-actions{flex-direction:column}.et-copy h1{font-size:46px;letter-spacing:-1px}.et-cta{flex-direction:column}.et-cta .et-btn{width:100%;min-width:0}.et-visual{min-height:540px}.et-couple{height:540px}.et-demo{top:110px;padding:22px}.et-cards,.et-proof{grid-template-columns:1fr}.et-proof div{justify-content:flex-start}}
      `}</style>
      {settings.promoBannerEnabled && settings.promoBannerText && (
        <div className="et-promo-banner">{settings.promoBannerText}</div>
      )}
      <div className="et-wrap">
        <nav className="et-nav">
          <a className="et-brand" href="/">
            <img src={settings.logoUrl || "/eterniza/assets/brand/logo-eterniza.png"} alt={settings.companyName || "Eterniza"} />
          </a>
          <div className="et-menu">
            <a href="/como-funciona">Como funciona</a>
            <a href="/exemplos">Exemplos</a>
            <a href="/planos">Planos</a>
            <a href="/perguntas">Perguntas</a>
          </div>
          <div className="et-actions">
            <a className="et-btn" href="/login">Entrar</a>
            <a className="et-btn gold" href="/cadastro">Criar minha homenagem</a>
          </div>
        </nav>

        <section className="et-hero">
          <div className="et-copy">
            <span className="et-badge">{settings.landingBadge}</span>
            <h1>{settings.landingTitleBefore} <em>{settings.landingTitleHighlight}</em></h1>
            <p>{settings.landingSubtitle}</p>
          </div>

          <div className="et-visual">
            <img className="et-couple" src="/eterniza/assets/brand/hero-couple.jpg" alt="Casal em homenagem Eterniza" />
            <div className="et-demo">
              <h3>Maria & José</h3>
              <p>24 de dezembro de 2021</p>
              <div className="et-stack">
                <img src="/eterniza/assets/brand/preview-couple.jpg" alt="Prévia da homenagem" />
                <span></span><span></span>
              </div>
              <a className="et-btn gold" href="/presente/demo-maria-e-jose">▶ Abrir surpresa</a>
            </div>
          </div>
        </section>

        {settings.landingShowExamples && <section className="et-cards" id="exemplos">
          <a className="et-card" href="/exemplos"><img src="/eterniza/assets/brand/card-romance.jpg" alt="Romance" /><b>❤️ Romance</b><span>Bodas, dias juntos, luas cheias, carta e música.</span></a>
          <a className="et-card" href="/exemplos"><img src="/eterniza/assets/brand/card-gratidao.jpg" alt="Gratidão" /><b>🌷 Gratidão</b><span>Homenagens para mãe, pai, avós e família.</span></a>
          <a className="et-card" href="/exemplos"><img src="/eterniza/assets/brand/card-amizade.jpg" alt="Amizade" /><b>🎉 Amizade</b><span>Memórias, risadas e datas marcantes.</span></a>
          <a className="et-card" href="/planos"><img src="/eterniza/assets/brand/card-venda.jpg" alt="Venda pronta" /><b>🎁 Venda pronta</b><span>Planos, links, painel, QR Code e gestão.</span></a>
        </section>}

        {settings.landingShowPlans && <section className="et-plans" id="planos">
          <div className="et-plans-head">
            <span>Planos Eterniza</span>
            <h2>Escolha como sua homenagem vai viver.</h2>
          </div>
          <div className="et-plan-grid">
            {visiblePlans.map(plan => (
              <article key={plan.slug || plan.id} className={`et-plan ${(plan.slug || plan.id) === 'premium' ? 'featured' : ''}`}>
                <h3>{plan.name}</h3>
                <div className="et-plan-price">{money(plan.priceCents ?? plan.cents)}</div>
                <p>{plan.description || `${plan.photos || 0} fotos e acesso ${plan.duration || 'vitalício'}.`}</p>
                <small>{plan.photos || 0} fotos • {plan.duration || 'vitalício'}</small>
              </article>
            ))}
          </div>
        </section>}

        {settings.landingShowProof && <section className="et-proof" id="como-funciona">
          <div><b>🔒</b><p><strong>100% Seguro</strong><span>Seus dados protegidos</span></p></div>
          <div><b>🏅</b><p><strong>Experiência única</strong><span>Como um filme de verdade</span></p></div>
          <div><b>☁️</b><p><strong>Acesso para sempre</strong><span>Na nuvem, onde estiver</span></p></div>
          <div><b>🎧</b><p><strong>Suporte humano</strong><span>Estamos com você</span></p></div>
        </section>}
      </div>
    </main>
  );
}
