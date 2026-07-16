"use client";

export default function PetsPage() {
  return (
    <main className="pets-page">
      <style>{`
        *{box-sizing:border-box}body{margin:0}
        .pets-page{min-height:100vh;background:radial-gradient(circle at 72% 18%,rgba(202,153,64,.18),transparent 29%),linear-gradient(135deg,#030a10,#071723 58%,#03070a);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;padding:26px}
        .pets-shell{max-width:1380px;margin:auto}.pets-nav{display:flex;align-items:center;justify-content:space-between;gap:18px}.pets-brand{color:#fff;text-decoration:none}.pets-brand strong{font:700 26px Georgia,serif}.pets-brand span{display:block;color:#d7b36b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
        .pets-nav-actions{display:flex;gap:10px}.pets-nav-actions a,.pets-actions a{display:inline-flex;align-items:center;justify-content:center;border-radius:13px;text-decoration:none;font-weight:950}
        .pets-nav-actions a{min-height:46px;padding:0 18px;color:#fff;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05)}.pets-nav-actions .primary,.pets-actions .primary{background:linear-gradient(135deg,#b78331,#f1d28a);color:#151008;border:0}
        .pets-hero{display:grid;grid-template-columns:minmax(0,.9fr) minmax(500px,1.1fr);align-items:center;gap:36px;min-height:720px}.pets-badge{display:inline-flex;padding:9px 14px;border-radius:999px;background:rgba(219,177,94,.12);border:1px solid rgba(219,177,94,.3);color:#f0cf8b;font-size:12px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}
        h1{font:700 clamp(52px,6.6vw,88px)/.94 Georgia,serif;margin:22px 0;color:#fffaf0;letter-spacing:-3px}h1 em{font-style:normal;color:#d8ad62}.pets-copy p{font-size:20px;line-height:1.6;color:#cbd6de;max-width:700px}
        .pets-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}.pets-actions a{min-height:58px;padding:0 26px}.pets-actions .primary{box-shadow:0 18px 48px rgba(190,140,53,.28)}.pets-actions .secondary{color:#fff;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05)}
        .pets-visual{position:relative}.pets-visual img{display:block;width:100%;border-radius:30px;box-shadow:0 38px 100px rgba(0,0,0,.5);border:1px solid rgba(229,194,125,.18)}
        .moments{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:-32px 0 34px;position:relative;z-index:2}.moment{padding:19px 14px;border-radius:18px;text-align:center;border:1px solid rgba(255,255,255,.09);background:rgba(5,15,23,.92);box-shadow:0 18px 46px rgba(0,0,0,.25)}.moment b{display:block;font-size:26px}.moment span{display:block;color:#c2d0da;font-size:12px;font-weight:850;margin-top:8px}
        .business{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding-bottom:36px}.business article{padding:28px;border-radius:23px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035)}.business h2{font:700 32px Georgia,serif;margin:0 0 10px}.business p{color:#aebfca;line-height:1.55}.business ul{color:#d8e2e8;line-height:1.9;padding-left:20px}
        @media(max-width:980px){.pets-hero{grid-template-columns:1fr;text-align:center;padding:70px 0;min-height:auto}.pets-copy p{margin:auto}.pets-actions{justify-content:center}.pets-visual{order:-1}.moments{grid-template-columns:repeat(3,1fr);margin-top:10px}.business{grid-template-columns:1fr}}
        @media(max-width:600px){.pets-page{padding:18px}.pets-nav-actions a:first-child{display:none}.pets-brand strong{font-size:21px}.pets-actions{flex-direction:column}.pets-actions a{width:100%}.moments{grid-template-columns:repeat(2,1fr)}h1{font-size:48px;letter-spacing:-2px}}
      `}</style>
      <div className="pets-shell">
        <nav className="pets-nav">
          <a href="/" className="pets-brand"><strong>🐾 Eterniza Pets</strong><span>Relacionamento com tutores</span></a>
          <div className="pets-nav-actions"><a href="/">Voltar ao Eterniza</a><a href="/pets/login" className="primary">Área da Clínica</a></div>
        </nav>

        <section className="pets-hero">
          <div className="pets-copy">
            <span className="pets-badge">Cada momento merece ser eternizado</span>
            <h1>Fortaleça o vínculo entre sua clínica e cada <em>família.</em></h1>
            <p>Crie experiências digitais com fotos, música e mensagens para despedidas, cirurgias, recuperações, altas, aniversários, adoções e outros capítulos importantes da vida do pet.</p>
            <div className="pets-actions">
              <a className="primary" href="/pets/cadastro">Cadastrar minha clínica</a>
              <a className="secondary" href="/pets/login">Já tenho acesso</a>
            </div>
          </div>
          <div className="pets-visual"><img src="/eterniza/assets/pets/eterniza-pets-institucional.png" alt="Eterniza Pets com cães e gatos em momentos especiais" /></div>
        </section>

        <section className="moments">
          <article className="moment"><b>🌈</b><span>Despedidas</span></article>
          <article className="moment"><b>🩺</b><span>Recuperações</span></article>
          <article className="moment"><b>🏥</b><span>Altas</span></article>
          <article className="moment"><b>🎂</b><span>Aniversários</span></article>
          <article className="moment"><b>🏠</b><span>Adoções</span></article>
          <article className="moment"><b>⭐</b><span>Momentos especiais</span></article>
        </section>

        <section className="business">
          <article><h2>Feito para clínicas veterinárias</h2><p>Um novo canal de relacionamento emocional com tutores, com identidade da clínica e tecnologia Eterniza.</p><ul><li>Logo da clínica e marca Eterniza juntas</li><li>Modelos para diferentes momentos</li><li>Equipe com acesso protegido</li><li>Relatórios e pacote mensal</li></ul></article>
          <article><h2>Cadastro sujeito à aprovação</h2><p>A clínica envia seus dados empresariais. A equipe Eterniza analisa e libera o acesso pelo painel administrativo.</p><div className="pets-actions"><a className="primary" href="/pets/cadastro">Enviar solicitação</a></div></article>
        </section>
      </div>
    </main>
  );
}
