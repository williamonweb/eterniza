"use client";

import { useEffect, useMemo, useState } from "react";

const PLANS = [
  { slug: "essencial", name: "Essencial", price: "R$ 19,90", desc: "Para uma homenagem simples e emocionante." },
  { slug: "premium", name: "Premium", price: "R$ 39,90", desc: "O mais escolhido. História completa com QR Code." },
  { slug: "eterno", name: "Eterno", price: "R$ 69,90", desc: "Experiência completa para eternizar para sempre." },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function load() {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meRes.ok || !meData?.ok) {
        window.location.replace("/login");
        return;
      }

      setUser(meData.user);

      const listRes = await fetch("/api/tributes/list");
      const listData = await listRes.json();

      if (listData?.ok && Array.isArray(listData.tributes)) {
        setTributes(listData.tributes);
      }
    } finally {
      setMounted(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = tributes.length;
    const drafts = tributes.filter((t) => String(t.status) === "DRAFT").length;
    const published = tributes.filter((t) => String(t.status) === "PUBLISHED").length;
    return { total, drafts, published };
  }, [tributes]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  async function createPayment(tribute, planSlug) {
    setCheckout({ step: "loading", tribute, planSlug });

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tributeId: tribute.id, plan: planSlug }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Erro ao gerar pagamento.");
      }

      setCheckout({
        step: "pix",
        tribute,
        planSlug,
        payment: data.payment,
      });
    } catch (error) {
      setCheckout(null);
      setModal({
        title: "Erro ao gerar PIX",
        text: error.message || "Não foi possível iniciar o pagamento.",
      });
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
    setModal({
      title: "Link copiado!",
      text: "Agora é só enviar para quem você ama.",
    });
  }

  async function deleteTribute(tribute) {
    try {
      const res = await fetch("/api/tributes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tributeId: tribute.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Não foi possível excluir a homenagem.");
      }

      setDeleteConfirm(null);
      setModal({
        title: "História excluída",
        text: "A homenagem foi removida com sucesso.",
      });
      await load();
    } catch (error) {
      setDeleteConfirm(null);
      setModal({
        title: "Erro ao excluir",
        text: error.message || "Não foi possível excluir a homenagem.",
      });
    }
  }

  if (!mounted || loading) {
    return <main style={{ minHeight: "100vh", background: "#030606" }} />;
  }

  return (
    <main className="client-page">
      <Style />

      <section className="shell">
        <header className="top">
          <div>
            <strong>❤️ Meu Eterniza</strong>
            <span>Aqui vivem as histórias que você criou.</span>
          </div>
          <button onClick={logout}>🚪 Sair</button>
        </header>

        <section className="hero">
          <div>
            <h1>Olá, {user?.name || "cliente"}.</h1>
            <p>
              Toda história merece ser lembrada. Continue seus rascunhos,
              publique suas homenagens e compartilhe momentos que vivem para sempre.
            </p>
          </div>

          <a className="gold" href="/criar">+ Criar nova história</a>
        </section>

        <section className="stats">
          <Card number={stats.total} label="histórias" />
          <Card number={stats.drafts} label="rascunhos" />
          <Card number={stats.published} label="publicadas" />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Minhas histórias</h2>
              <p>Escolha uma história para continuar, publicar ou compartilhar.</p>
            </div>
            <a className="gold small" href="/criar">Criar nova</a>
          </div>

          {tributes.length === 0 ? (
            <div className="empty">
              <h3>Você ainda não criou nenhuma história.</h3>
              <p>Comece criando um presente digital emocionante.</p>
              <a className="gold" href="/criar">Criar primeira história</a>
            </div>
          ) : (
            <div className="cards">
              {tributes.map((tribute) => (
                <TributeCard
                  key={tribute.id}
                  tribute={tribute}
                  onPublish={() => setCheckout({ step: "plans", tribute })}
                  onCopy={copyText}
                  onDelete={() => setDeleteConfirm(tribute)}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {checkout && (
        <CheckoutModal
          checkout={checkout}
          onClose={() => setCheckout(null)}
          onCreatePayment={createPayment}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          tribute={deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => deleteTribute(deleteConfirm)}
        />
      )}

      {modal && (
        <InfoModal
          title={modal.title}
          text={modal.text}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}

function Card({ number, label }) {
  return (
    <div className="stat">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}

function TributeCard({ tribute, onPublish, onCopy, onDelete }) {
  const status = String(tribute.status || "DRAFT").toUpperCase();
  const isPublished = status === "PUBLISHED";
  const title = tribute.receiver_name || tribute.title || "História";
  const publicUrl = tribute.slug ? `/presente/${tribute.slug}` : null;
  const fullPublicUrl =
    publicUrl && typeof window !== "undefined"
      ? `${window.location.origin}${publicUrl}`
      : publicUrl;

  return (
    <article className="tribute-card">
      <div className="image">
        <img src="/eterniza/assets/brand/preview-couple.jpg" alt={title} />
      </div>

      <span className={`pill ${isPublished ? "published" : ""}`}>
        {isPublished ? "Publicado" : "Rascunho"}
      </span>

      <h3>{title}</h3>
      <p>{tribute.category || "Presente"} • Eterniza</p>

      {isPublished && publicUrl && (
        <div className="public-link-box">
          <small>Link público</small>
          <code>{publicUrl}</code>
        </div>
      )}

      <div className="actions">
        {isPublished && publicUrl ? (
          <>
            <a className="gold small" href={publicUrl} target="_blank" rel="noreferrer">
              Ver história
            </a>
            <button onClick={() => onCopy(fullPublicUrl || publicUrl)}>
              Copiar link
            </button>
            <button className="danger" onClick={onDelete}>
              Excluir
            </button>
          </>
        ) : (
          <>
            <a className="gold small" href="/criar">Continuar criando</a>
            <button onClick={onPublish}>❤️ Publicar história</button>
            <button className="danger" onClick={onDelete}>
              Excluir
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function CheckoutModal({ checkout, onClose, onCreatePayment }) {
  const tribute = checkout.tribute;

  return (
    <div className="modal-overlay">
      <div className="checkout-modal">
        <button className="modal-close" onClick={onClose}>×</button>

        {checkout.step === "plans" && (
          <>
            <h2>❤️ Publicar sua história</h2>
            <p className="modal-sub">
              Sua história está pronta. Escolha como deseja eternizar este momento.
            </p>

            <div className="plan-grid">
              {PLANS.map((plan) => (
                <article className={plan.slug === "premium" ? "plan featured" : "plan"} key={plan.slug}>
                  {plan.slug === "premium" && <span className="tag">Mais escolhido</span>}
                  <h3>{plan.name}</h3>
                  <strong>{plan.price}</strong>
                  <p>{plan.desc}</p>
                  <button onClick={() => onCreatePayment(tribute, plan.slug)}>
                    Quero este plano ❤️
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {checkout.step === "loading" && (
          <div className="payment-state">
            <h2>Gerando pagamento...</h2>
            <p>Estamos preparando seu PIX com segurança.</p>
          </div>
        )}

        {checkout.step === "pix" && (
          <div className="payment-state">
            <h2>PIX gerado com sucesso</h2>
            <p>Pague com o QR Code abaixo. Após a aprovação, sua história será publicada automaticamente.</p>

            {checkout.payment?.qrCodeBase64 && (
              <img
                className="pix-img"
                src={`data:image/png;base64,${checkout.payment.qrCodeBase64}`}
                alt="QR Code PIX"
              />
            )}

            {checkout.payment?.qrCode && (
              <textarea readOnly value={checkout.payment.qrCode} />
            )}

            <button
              className="gold full"
              onClick={() => navigator.clipboard.writeText(checkout.payment.qrCode)}
            >
              Copiar PIX copia e cola
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ tribute, onCancel, onConfirm }) {
  const title = tribute?.receiver_name || tribute?.title || "esta história";

  return (
    <div className="modal-overlay">
      <div className="info-modal danger-modal">
        <span className="danger-icon">🗑️</span>
        <h2>Excluir homenagem</h2>
        <p>
          Tem certeza que deseja excluir <strong>{title}</strong>?
        </p>
        <p className="danger-warning">
          Esta ação é permanente e não poderá ser desfeita.
        </p>
        <div className="modal-actions">
          <button onClick={onCancel}>Cancelar</button>
          <button className="danger solid" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoModal({ title, text, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="info-modal">
        <h2>{title}</h2>
        <p>{text}</p>
        <button className="gold full" onClick={onClose}>Entendi</button>
      </div>
    </div>
  );
}

function Style() {
  return (
    <style>{`
.client-page{min-height:100vh;background:radial-gradient(circle at 12% 0%,rgba(239,189,82,.14),transparent 32%),linear-gradient(135deg,#050706,#071117 62%,#030606);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;padding:28px;box-sizing:border-box}
.shell{max-width:1180px;margin:0 auto;display:grid;gap:18px}
.top,.hero,.panel,.stat,.tribute-card,.checkout-modal,.info-modal{border:1px solid rgba(239,189,82,.18);background:rgba(255,255,255,.055);border-radius:24px;box-shadow:0 28px 80px rgba(0,0,0,.28)}
.top{padding:18px 22px;display:flex;justify-content:space-between;align-items:center}
.top strong{font-size:24px;color:#f6cf72}.top span{display:block;color:#f1d89a;font-size:14px;margin-top:3px}
.top button,.gold{border:0;border-radius:15px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#130d05;font-weight:1000;padding:14px 20px;text-decoration:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.hero{padding:34px;display:flex;justify-content:space-between;align-items:center;gap:24px}
.hero h1{font-family:Georgia,serif;font-size:46px;margin:0 0 10px;color:#fff8ea}
.hero p{margin:0;color:#ead9b7;font-size:18px;max-width:720px;line-height:1.5}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.stat{padding:22px}.stat strong{display:block;font-size:34px;color:#f6cf72}.stat span{color:#f1dfb6}
.panel{padding:26px}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:20px}
.panel h2{font-family:Georgia,serif;font-size:34px;margin:0;color:#fff8ea}.panel p{color:#ead9b7;margin:5px 0 0}
.cards{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:16px}
.tribute-card{padding:18px;display:grid;gap:10px}.image img{width:100%;height:150px;object-fit:cover;border-radius:16px}
.pill{width:max-content;border:1px solid rgba(239,189,82,.28);color:#f6cf72;border-radius:999px;padding:7px 11px;font-size:13px;font-weight:900}
.pill.published{border-color:rgba(100,255,160,.32);color:#8dffb2}
.tribute-card h3{margin:4px 0 0;color:#fff8ea;font-size:22px}.tribute-card p{margin:0;color:#ead9b7}
.public-link-box{border:1px solid rgba(239,189,82,.18);background:rgba(0,0,0,.22);border-radius:14px;padding:10px 12px;display:grid;gap:4px;max-width:100%;overflow:hidden}
.public-link-box small{color:#f6cf72;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
.public-link-box code{color:#fff8ea;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.actions button,.plan button{border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:11px 14px;font-weight:900;cursor:pointer}
.actions button.danger,.danger{border-color:rgba(255,92,92,.42)!important;color:#ffd6d6!important;background:rgba(255,70,70,.08)!important}
.danger.solid{background:linear-gradient(135deg,#b91c1c,#ef4444)!important;border:0!important;color:#fff!important}
.small{padding:11px 15px;font-size:14px}.full{width:100%}
.empty{border:1px dashed rgba(239,189,82,.28);border-radius:22px;padding:30px;text-align:center;background:rgba(0,0,0,.18)}
.empty h3{margin:0 0 8px;color:#f6cf72}.empty p{margin:0 0 18px;color:#ead9b7}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);z-index:100;display:flex;align-items:center;justify-content:center;padding:22px}
.checkout-modal{width:min(920px,96vw);padding:30px;position:relative}.modal-close{position:absolute;right:18px;top:16px;width:42px;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:28px;cursor:pointer}
.checkout-modal h2,.info-modal h2{font-family:Georgia,serif;font-size:38px;color:#fff8ea;margin:0 50px 10px 0}.modal-sub{color:#ead9b7;font-size:17px;margin-bottom:22px}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.plan{border:1px solid rgba(239,189,82,.18);background:rgba(0,0,0,.18);border-radius:20px;padding:20px;position:relative}.plan.featured{border-color:rgba(239,189,82,.55)}
.plan h3{font-size:24px;margin:0 0 8px}.plan strong{font-size:30px;color:#f6cf72}.plan p{color:#ead9b7;min-height:56px}.tag{position:absolute;right:14px;top:14px;background:#f6cf72;color:#130d05;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:1000}
.payment-state{text-align:center;max-width:560px;margin:0 auto}.payment-state p{color:#ead9b7}
.pix-img{width:280px;max-width:100%;background:#fff;border-radius:18px;padding:14px;margin:10px auto;display:block}
textarea{width:100%;min-height:96px;border-radius:16px;border:1px solid rgba(239,189,82,.22);background:rgba(255,255,255,.08);color:#fff;padding:14px;box-sizing:border-box}
.info-modal{width:min(480px,96vw);padding:28px;text-align:center}
.danger-modal{border-color:rgba(255,92,92,.28)}
.danger-icon{display:inline-flex;width:54px;height:54px;align-items:center;justify-content:center;border-radius:18px;background:rgba(255,70,70,.12);font-size:28px;margin-bottom:8px}
.danger-warning{color:#ffd6d6!important;background:rgba(255,70,70,.08);border:1px solid rgba(255,92,92,.22);border-radius:16px;padding:12px}
.modal-actions{display:flex;gap:10px;margin-top:18px}
.modal-actions button{flex:1;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:14px;padding:13px 16px;font-weight:1000;cursor:pointer}
@media(max-width:850px){.client-page{padding:16px}.hero,.panel-head,.top{align-items:flex-start;flex-direction:column}.stats,.cards,.plan-grid{grid-template-columns:1fr}.hero h1{font-size:36px}}
`}</style>
  );
}