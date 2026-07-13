"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_PLANS = [
  { slug: "essencial", name: "Essencial", price: "R$ 19,90", desc: "Para uma homenagem simples e emocionante." },
  { slug: "premium", name: "Premium", price: "R$ 39,90", desc: "O mais escolhido. História completa com QR Code." },
  { slug: "eterno", name: "Eterno", price: "R$ 69,90", desc: "Experiência completa para eternizar para sempre." },
];

function formatMoney(cents) {
  return (Number(cents || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;

  return digit === Number(cpf[10]);
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [plans, setPlans] = useState(DEFAULT_PLANS);

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

      const plansRes = await fetch("/api/plans");
      const plansData = await plansRes.json().catch(() => ({}));

      if (plansData?.ok && Array.isArray(plansData.plans) && plansData.plans.length) {
        setPlans(
          plansData.plans.map((plan) => ({
            slug: plan.slug,
            name: plan.name,
            price: formatMoney(plan.priceCents),
            desc: plan.description || plan.desc || "",
            promoActive: plan.promoActive,
            promoName: plan.promoName,
            regularPrice: plan.regularPriceCents ? formatMoney(plan.regularPriceCents) : null,
          }))
        );
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
    const views = tributes.reduce((sum, tribute) => sum + Number(tribute.views_count || 0), 0);
    return { total, drafts, published, views };
  }, [tributes]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  function tributePlanSlug(tribute) {
    const direct =
      tribute?.plan_id ||
      tribute?.planId ||
      tribute?.content?.plan?.slug ||
      tribute?.content?.plan?.id ||
      "";

    if (direct) return String(direct).toLowerCase();

    const name = String(tribute?.plan_name || tribute?.planName || "").toLowerCase();
    if (name.includes("essencial")) return "essencial";
    if (name.includes("eterno")) return "eterno";
    if (name.includes("premium")) return "premium";
    return "";
  }

  function startPublish(tribute) {
    const savedPlanSlug = tributePlanSlug(tribute);

    if (!savedPlanSlug) {
      setModal({
        title: "Plano não encontrado",
        text: "Esta história antiga não possui um plano salvo. Abra a história, escolha o plano e salve novamente antes de gerar o PIX.",
      });
      return;
    }

    createPayment(tribute, savedPlanSlug);
  }

  async function deleteTribute() {
    if (!deleteTarget?.id || deleting) return;

    setDeleting(true);

    try {
      const res = await fetch("/api/tributes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tributeId: deleteTarget.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Não foi possível excluir a história.");
      }

      setTributes((current) =>
        current.filter((tribute) => tribute.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
      setModal({
        title: "História excluída",
        text: "A história foi removida do seu painel.",
      });
    } catch (error) {
      setDeleteTarget(null);
      setModal({
        title: "Erro ao excluir",
        text: error.message || "Não foi possível excluir a história.",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function createPayment(tribute, planSlug, cpfCnpj) {
    const cpf = onlyDigits(cpfCnpj || "");

    if (!cpf) {
      try {
        const billingRes = await fetch("/api/user/billing", { cache: "no-store" });
        const billingData = await billingRes.json().catch(() => ({}));

        if (billingData?.ok && billingData.billing?.cpf) {
          return createPayment(tribute, planSlug, billingData.billing.cpf);
        }
      } catch (error) {
        console.warn("Não foi possível buscar CPF salvo.", error);
      }

      setCheckout({
        step: "cpf",
        tribute,
        planSlug,
        cpf: "",
        phone: user?.phone || "",
        error: "",
      });
      return;
    }

    if (!isValidCpf(cpf)) {
      setCheckout({
        step: "cpf",
        tribute,
        planSlug,
        cpf: formatCpf(cpf),
        phone: user?.phone || "",
        error: "Informe um CPF válido para gerar o PIX.",
      });
      return;
    }

    setCheckout({ step: "loading", tribute, planSlug });

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tributeId: tribute.id, plan: planSlug, cpfCnpj: cpf }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data?.code === "CPF_REQUIRED") {
          setCheckout({
            step: "cpf",
            tribute,
            planSlug,
            cpf: formatCpf(cpf),
            phone: user?.phone || "",
            error: data.message || "Informe um CPF válido para gerar o PIX.",
          });
          return;
        }
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

  if (!mounted || loading) {
    return <main style={{ minHeight: "100vh", background: "#030606" }} />;
  }

  return (
    <main className="client-page">
      <Style />

      <section className="shell">
        <header className="top">
          <a className="brand-lockup" href="/">
            <img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza" />
            <div>
              <strong>Meu Eterniza</strong>
              <span>Onde cada história vive para sempre.</span>
            </div>
          </a>
          <div className="top-actions">
            <a className="top-new" href="/criar">+ Nova história</a>
            <button onClick={logout}>Sair</button>
          </div>
        </header>

        <section className="hero hero-premium">
          <div className="hero-copy">
            <span className="eyebrow">Painel do cliente</span>
            <h1>Bem-vindo de volta, {user?.name?.split(" ")?.[0] || "cliente"}.</h1>
            <p>
              Continue seus rascunhos, publique suas homenagens e acompanhe as histórias
              criadas para pessoas especiais.
            </p>
            <div className="hero-actions">
              <a className="gold" href="/criar">Criar nova homenagem</a>
              <a className="hero-link" href="#historias">Ver minhas histórias</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/eterniza/assets/brand/preview-couple.jpg" alt="Experiência Eterniza" />
            <div className="hero-count"><span>Histórias eternizadas</span><strong>{stats.total}</strong></div>
          </div>
        </section>

        <section className="stats">
          <Card icon="📚" number={stats.total} label="Histórias" detail="Total criado" />
          <Card icon="📝" number={stats.drafts} label="Rascunhos" detail="Em construção" />
          <Card icon="✨" number={stats.published} label="Publicadas" detail="Prontas para compartilhar" />
          <Card icon="👁️" number={stats.views} label="Visualizações" detail="Em todas as histórias" />
        </section>

        <section className="panel" id="historias">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Sua coleção</span>
              <h2>Minhas histórias</h2>
              <p>Gerencie, publique e compartilhe suas homenagens.</p>
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
                  onPublish={() => startPublish(tribute)}
                  onCopy={copyText}
                  onDelete={() => setDeleteTarget(tribute)}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {checkout && (
        <CheckoutModal
          checkout={checkout}
          plans={plans}
          onClose={() => setCheckout(null)}
          onCreatePayment={createPayment}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          tribute={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) setDeleteTarget(null);
          }}
          onConfirm={deleteTribute}
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

function Card({ icon, number, label, detail }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <strong>{Number(number || 0).toLocaleString("pt-BR")}</strong>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
}

function planClass(value) {
  const slug = String(value || "premium").toLowerCase();
  if (slug === "essencial") return "essential";
  if (slug === "eterno") return "eternal";
  return "premium";
}

function TributeCard({ tribute, onPublish, onCopy, onDelete }) {
  const status = String(tribute.status || "DRAFT").toUpperCase();
  const isPublished = status === "PUBLISHED";
  const title = tribute.receiver_name || tribute.title || "História";
  const planSlug = tribute.plan_id || tribute.plan?.slug || "premium";
  const planName = tribute.plan_name || tribute.plan?.name || "Premium";
  const photoCount = Number(tribute.photos_count || tribute.photos?.length || 0);
  const photoLimit = Number(tribute.plan_photos || tribute.plan?.photos || 0);
  const thumbnail = tribute.thumbnail_url || tribute.photos?.[0]?.url || "/eterniza/assets/brand/preview-couple.jpg";
  const publicUrl = tribute.slug ? `/presente/${tribute.slug}` : null;
  const fullPublicUrl =
    publicUrl && typeof window !== "undefined"
      ? `${window.location.origin}${publicUrl}`
      : publicUrl;

  return (
    <article className="tribute-card">
      <div className="image">
        <img src={thumbnail} alt={title} />
        <div className="image-shade"></div>
        <span className={`pill ${isPublished ? "published" : ""}`}>{isPublished ? "Publicada" : "Rascunho"}</span>
        <span className={`plan-pill ${planClass(planSlug)}`}>{planName}</span>
      </div>

      <div className="tribute-content">
        <div className="tribute-heading"><div><small>{tribute.category || "Homenagem"}</small><h3>{title}</h3></div><span>❤</span></div>
        <div className="meta-grid">
          <div><span>Fotos</span><strong>{photoCount}{photoLimit ? ` / ${photoLimit}` : ""}</strong></div>
          <div><span>Visualizações</span><strong>{Number(tribute.views_count || 0).toLocaleString("pt-BR")}</strong></div>
          <div><span>Criada em</span><strong>{formatDate(tribute.created_at)}</strong></div>
          <div><span>Validade</span><strong>{tribute.plan_duration || "Vitalícia"}</strong></div>
        </div>

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
            <button className="danger-action" onClick={onDelete}>
              Excluir
            </button>
          </>
        ) : (
          <>
            <a className="gold small" href="/criar">Continuar criando</a>
            <button onClick={onPublish}>❤️ Publicar história</button>
            <button className="danger-action" onClick={onDelete}>
              Excluir
            </button>
          </>
        )}
        </div>
      </div>
    </article>
  );
}

function CheckoutModal({ checkout, plans, onClose, onCreatePayment }) {
  const tribute = checkout.tribute;
  const selectedPlan =
    checkout.payment?.plan ||
    plans.find((plan) => plan.slug === checkout.planSlug) ||
    null;

  return (
    <div className="modal-overlay">
      <div className="checkout-modal">
        <button className="modal-close" onClick={onClose}>×</button>

        {checkout.step === "cpf" && (
          <CpfPaymentStep
            checkout={checkout}
            onClose={onClose}
            onCreatePayment={onCreatePayment}
          />
        )}

        {checkout.step === "loading" && (
          <div className="payment-state">
            <h2>Gerando pagamento...</h2>
            <p>Estamos preparando seu PIX com segurança.</p>
            {selectedPlan && (
              <div className="selected-plan-summary">
                <span>Plano selecionado</span>
                <strong>{selectedPlan.name}</strong>
              </div>
            )}
          </div>
        )}

        {checkout.step === "pix" && (
          <div className="payment-state">
            <h2>PIX gerado com sucesso</h2>
            <p>Pague com o QR Code abaixo. Após a aprovação, sua história será publicada automaticamente.</p>
            {selectedPlan && (
              <div className="selected-plan-summary">
                <span>Plano da história</span>
                <strong>{selectedPlan.name}</strong>
              </div>
            )}

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

function CpfPaymentStep({ checkout, onCreatePayment }) {
  const [cpf, setCpf] = useState(checkout.cpf || "");
  const [phone, setPhone] = useState(formatPhone(checkout.phone || ""));
  const [error, setError] = useState(checkout.error || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const digits = onlyDigits(cpf);

    if (!isValidCpf(digits)) {
      setError("Informe um CPF válido para gerar o PIX.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: digits, phone }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Não foi possível salvar o CPF.");
      }

      await onCreatePayment(checkout.tribute, checkout.planSlug, digits);
    } catch (err) {
      setError(err.message || "Não foi possível salvar os dados de pagamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="payment-state cpf-state">
      <h2>Dados para pagamento</h2>
      <p>Para gerar o PIX em produção, o Asaas exige o CPF do comprador.</p>

      <label className="pay-label">
        CPF obrigatório
        <input
          value={cpf}
          onChange={(event) => setCpf(formatCpf(event.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
        />
      </label>

      <label className="pay-label">
        Telefone opcional
        <input
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          placeholder="(51) 99999-9999"
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
        />
      </label>

      {error && <div className="form-error">{error}</div>}

      <button className="gold full" onClick={submit} disabled={saving}>
        {saving ? "Salvando..." : "Gerar PIX"}
      </button>
    </div>
  );
}

function ConfirmDeleteModal({ tribute, deleting, onCancel, onConfirm }) {
  const title =
    tribute?.receiver_name ||
    tribute?.receiverName ||
    tribute?.title ||
    "esta história";

  return (
    <div className="modal-overlay">
      <div className="info-modal confirm-delete-modal">
        <div className="delete-icon">🗑️</div>
        <h2>Excluir história?</h2>
        <p>
          Você está prestes a excluir <strong>{title}</strong>. Essa ação não poderá
          ser desfeita.
        </p>
        <div className="confirm-actions">
          <button onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
          <button className="danger-confirm" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Excluindo..." : "Sim, excluir"}
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
.small{padding:11px 15px;font-size:14px}.full{width:100%}
.empty{border:1px dashed rgba(239,189,82,.28);border-radius:22px;padding:30px;text-align:center;background:rgba(0,0,0,.18)}
.empty h3{margin:0 0 8px;color:#f6cf72}.empty p{margin:0 0 18px;color:#ead9b7}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);z-index:100;display:flex;align-items:center;justify-content:center;padding:22px}
.checkout-modal{width:min(920px,96vw);padding:30px;position:relative}.modal-close{position:absolute;right:18px;top:16px;width:42px;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:28px;cursor:pointer}
.checkout-modal h2,.info-modal h2{font-family:Georgia,serif;font-size:38px;color:#fff8ea;margin:0 50px 10px 0}.modal-sub{color:#ead9b7;font-size:17px;margin-bottom:22px}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.plan{border:1px solid rgba(239,189,82,.18);background:rgba(0,0,0,.18);border-radius:20px;padding:20px;position:relative}.plan.featured{border-color:rgba(239,189,82,.55)}
.plan h3{font-size:24px;margin:0 0 8px}.plan strong{font-size:30px;color:#f6cf72}.plan p{color:#ead9b7;min-height:56px}.old-price{display:block;color:#cbb98f;text-decoration:line-through;margin-top:4px}.tag{position:absolute;right:14px;top:14px;background:#f6cf72;color:#130d05;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:1000}
.payment-state{text-align:center;max-width:560px;margin:0 auto}.payment-state p{color:#ead9b7}
.pix-img{width:280px;max-width:100%;background:#fff;border-radius:18px;padding:14px;margin:10px auto;display:block}
textarea{width:100%;min-height:96px;border-radius:16px;border:1px solid rgba(239,189,82,.22);background:rgba(255,255,255,.08);color:#fff;padding:14px;box-sizing:border-box}
.info-modal{width:min(480px,96vw);padding:28px;text-align:center}
.pay-label{display:grid;gap:8px;text-align:left;color:#f6cf72;font-weight:900;margin:14px 0}.pay-label input{width:100%;box-sizing:border-box;border:1px solid rgba(239,189,82,.24);background:rgba(255,255,255,.08);color:#fff;border-radius:15px;padding:14px;font-size:16px}.form-error{border:1px solid rgba(255,90,90,.32);background:rgba(255,90,90,.09);color:#ffd0d0;border-radius:14px;padding:12px;margin:12px 0;text-align:left}.cpf-state{max-width:460px}.gold:disabled{opacity:.65;cursor:not-allowed}

.actions .danger-action{border-color:rgba(255,105,105,.38);color:#ffb6b6}
.actions .danger-action:hover{border-color:#ff7575;background:rgba(255,80,80,.12)}
.confirm-delete-modal{max-width:470px;text-align:center}
.delete-icon{font-size:42px;margin-bottom:8px}
.confirm-delete-modal p strong{color:#fff8ea}
.confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}
.confirm-actions button{min-height:50px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font-weight:900;cursor:pointer}
.confirm-actions .danger-confirm{border-color:rgba(255,95,95,.5);background:linear-gradient(135deg,#8f2828,#d95454);color:#fff}
.confirm-actions button:disabled{opacity:.6;cursor:wait}
.selected-plan-summary{width:min(430px,100%);box-sizing:border-box;margin:16px auto;border:1px solid rgba(239,189,82,.22);background:rgba(0,0,0,.22);border-radius:16px;padding:13px 16px;display:flex;justify-content:space-between;gap:16px;align-items:center}
.selected-plan-summary span{color:#ead9b7}
.selected-plan-summary strong{color:#f6cf72;font-size:18px}

.brand-lockup{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none}.brand-lockup img{width:56px;height:56px;object-fit:contain;border-radius:16px;background:#020202}.brand-lockup strong{font-size:21px;color:#f6cf72}.brand-lockup span{display:block;color:#d8c6a2;font-size:13px;margin-top:3px}.top-actions{display:flex;gap:10px}.top-new{border:1px solid rgba(239,189,82,.24);border-radius:13px;padding:12px 16px;color:#fff;text-decoration:none;font-weight:900;background:rgba(255,255,255,.04)}
.hero-premium{display:grid;grid-template-columns:1.05fr .95fr;padding:0;overflow:hidden;min-height:390px}.hero-copy{padding:42px;display:flex;flex-direction:column;justify-content:center}.eyebrow{color:#efbd52;text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:1000}.hero-copy h1{font-size:clamp(42px,5vw,68px);line-height:.98}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.hero-link{border:1px solid rgba(239,189,82,.24);border-radius:15px;padding:14px 20px;color:#fff;text-decoration:none;font-weight:900}.hero-image{position:relative;min-height:390px}.hero-image img{width:100%;height:100%;object-fit:cover}.hero-image:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#071117 0%,rgba(7,17,23,.2) 45%,rgba(0,0,0,.08))}.hero-count{position:absolute;right:22px;bottom:22px;z-index:2;border:1px solid rgba(239,189,82,.3);background:rgba(3,7,8,.8);border-radius:18px;padding:15px 18px;text-align:right}.hero-count span{display:block;color:#dbc9a8;font-size:12px}.hero-count strong{display:block;color:#f6cf72;font-size:34px}
.stats{grid-template-columns:repeat(4,1fr)}.stat{display:flex;align-items:center;gap:14px}.stat-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:rgba(239,189,82,.1);border:1px solid rgba(239,189,82,.18);font-size:22px}.stat small{display:block;color:#a99f90;margin-top:3px}
.tribute-card{padding:0;overflow:hidden;transition:.25s}.tribute-card:hover{transform:translateY(-4px);border-color:rgba(239,189,82,.42)}.image{position:relative;height:210px}.image img{height:100%;display:block;transition:.4s}.tribute-card:hover .image img{transform:scale(1.035)}.image-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.6))}.pill{position:absolute;left:14px;top:14px;z-index:2;background:rgba(124,86,27,.82)}.pill.published{background:rgba(31,140,77,.8)}.plan-pill{position:absolute;right:14px;top:14px;z-index:2;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:1000}.plan-pill.essential{background:rgba(33,107,77,.86);color:#d7ffec}.plan-pill.premium{background:rgba(179,126,35,.88);color:#fff3c8}.plan-pill.eternal{background:rgba(92,57,139,.88);color:#f0ddff}.tribute-content{padding:19px}.tribute-heading{display:flex;justify-content:space-between;gap:12px}.tribute-heading small{color:#d9bb78;text-transform:uppercase;font-size:11px;letter-spacing:.08em;font-weight:900}.tribute-heading h3{font-family:Georgia,serif;font-size:27px;color:#fff7ea;margin:5px 0 0}.tribute-heading>span{color:#efbd52}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:17px 0}.meta-grid div{border:1px solid rgba(239,189,82,.12);background:rgba(0,0,0,.18);border-radius:13px;padding:10px}.meta-grid span{display:block;color:#9f978a;font-size:10px;text-transform:uppercase}.meta-grid strong{display:block;color:#f3dfb4;margin-top:4px;font-size:13px}.actions{display:grid;grid-template-columns:1fr 1fr}.actions .danger-action{grid-column:1/-1}
@media(max-width:1050px){.hero-premium{grid-template-columns:1fr}.hero-image{min-height:300px}.stats{grid-template-columns:repeat(2,1fr)}.cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:850px){.client-page{padding:14px}.hero,.panel-head,.top{align-items:flex-start;flex-direction:column}.hero-copy{padding:28px}.hero-image{min-height:250px}.stats,.cards,.plan-grid{grid-template-columns:1fr}.hero h1{font-size:40px}.top-actions{width:100%;flex-direction:column}.top-actions>*{width:100%;justify-content:center}.actions{grid-template-columns:1fr}.actions .danger-action{grid-column:auto}}
`}</style>
  );
}