"use client";

import { useEffect, useMemo, useState } from "react";

const menu = [
  ["dashboard", "▦", "Dashboard"],
  ["homenagens", "♥", "Homenagens"],
  ["clientes", "◉", "Clientes"],
  ["pagamentos", "◆", "Pagamentos"],
  ["planos", "✦", "Planos e promoções"],
  ["analytics", "⌁", "Analytics"],
  ["cupons", "◇", "Cupons"],
  ["configuracoes", "⚙", "Configurações", true],
];

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function date(value, withTime = false) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("pt-BR", withTime
    ? { dateStyle: "short", timeStyle: "short" }
    : { dateStyle: "short" });
}

function statusClass(status) {
  const value = String(status || "").toUpperCase();
  if (["APPROVED", "RECEIVED", "CONFIRMED", "PUBLISHED"].includes(value)) return "success";
  if (["CANCELLED", "REFUNDED", "OVERDUE"].includes(value)) return "danger";
  return "pending";
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [savingPlans, setSavingPlans] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponEditor, setCouponEditor] = useState(null);
  const [savingCoupon, setSavingCoupon] = useState(false);

  async function load() {
    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const me = await meRes.json().catch(() => ({}));

      if (
        !meRes.ok ||
        !me?.ok ||
        String(me.user?.role || "").toUpperCase() !== "ADMIN"
      ) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);

      const [dashboardRes, plansRes, couponsRes] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/plans", { cache: "no-store" }),
        fetch("/api/admin/coupons", { cache: "no-store" }),
      ]);

      const dashboardData = await dashboardRes.json().catch(() => ({}));
      const plansData = await plansRes.json().catch(() => ({}));
      const couponsData = await couponsRes.json().catch(() => ({}));

      if (dashboardData?.ok) setData(dashboardData);
      if (plansData?.ok && Array.isArray(plansData.plans)) {
        setPlans(plansData.plans.map(toEditablePlan));
      }
      if (couponsData?.ok && Array.isArray(couponsData.coupons)) {
        setCoupons(couponsData.coupons);
      }
    } catch (error) {
      console.error(error);
      setModal({
        title: "Erro ao carregar",
        text: "Não foi possível carregar todos os dados do painel.",
      });
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    load();
  }, [mounted]);

  const filteredTributes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data?.tributes || [];
    return (data?.tributes || []).filter((item) =>
      JSON.stringify(item).toLowerCase().includes(term)
    );
  }, [data, query]);

  const filteredClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data?.clients || [];
    return (data?.clients || []).filter((item) =>
      JSON.stringify(item).toLowerCase().includes(term)
    );
  }, [data, query]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  function updatePlan(index, field, value) {
    setPlans((current) =>
      current.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [field]: value } : plan
      )
    );
  }

  async function savePlans() {
    setSavingPlans(true);

    try {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Não foi possível salvar os planos.");
      }

      setPlans(result.plans.map(toEditablePlan));
      setModal({
        title: "Planos atualizados",
        text: "Os novos valores já estão ativos na landing, criação e PIX.",
      });
    } catch (error) {
      setModal({
        title: "Erro ao salvar",
        text: error.message || "Não foi possível salvar os planos.",
      });
    } finally {
      setSavingPlans(false);
    }
  }


  async function saveCoupon(form) {
    setSavingCoupon(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Não foi possível salvar o cupom.");
      }

      setCouponEditor(null);
      await load();
      setModal({ title: "Cupom salvo", text: result.message });
    } catch (error) {
      setModal({
        title: "Erro ao salvar",
        text: error.message || "Não foi possível salvar o cupom.",
      });
    } finally {
      setSavingCoupon(false);
    }
  }

  async function deleteCoupon(id) {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Não foi possível remover o cupom.");
      }

      await load();
      setModal({ title: "Cupom atualizado", text: result.message });
    } catch (error) {
      setModal({
        title: "Erro no cupom",
        text: error.message || "Não foi possível remover o cupom.",
      });
    }
  }

  if (!mounted) {
    return null;
  }

  if (booting) {
    return (
      <main className="admin-loading-page" suppressHydrationWarning>
        <Style />
        <div className="admin-loading-card">
          <div className="loader">E</div>
          <strong>Carregando painel...</strong>
          <span>Buscando vendas, clientes e homenagens.</span>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="admin-page" suppressHydrationWarning>
        <Style />
        <section className="locked">
          <img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza" />
          <h1>Acesso administrativo</h1>
          <p>Entre com uma conta administradora para acessar o painel.</p>
          <a href="/login">Ir para login</a>
        </section>
      </main>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <main className="admin-page" suppressHydrationWarning>
      <Style />

      <aside className="sidebar">
        <a className="admin-brand" href="/">
          <img src="/eterniza/assets/brand/logo-eterniza.png" alt="Eterniza" />
          <div><strong>Eterniza</strong><span>Administração</span></div>
        </a>

        <nav>
          {menu.map(([id, icon, label, soon]) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => setActive(id)}
            >
              <span>{icon}</span>
              <b>{label}</b>
              {soon && <em>Em breve</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <small>Ambiente administrativo</small>
          <button onClick={logout}>Sair da conta</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Eterniza Business</span>
            <h1>{sectionTitle(active)}</h1>
          </div>
          <div className="admin-user">
            <div className="avatar">{(data?.admin?.name || "A").slice(0, 1)}</div>
            <div><strong>{data?.admin?.name || "Administrador"}</strong><span>Online agora</span></div>
          </div>
        </header>

        {active === "dashboard" && (
          <Dashboard data={data} metrics={metrics} setActive={setActive} />
        )}

        {active === "homenagens" && (
          <DataSection
            title="Homenagens"
            description="Acompanhe rascunhos, publicações, planos e visualizações."
            query={query}
            setQuery={setQuery}
          >
            <TributesTable items={filteredTributes} />
          </DataSection>
        )}

        {active === "clientes" && (
          <DataSection
            title="Clientes"
            description="Cadastros reais e quantidade de homenagens criadas."
            query={query}
            setQuery={setQuery}
          >
            <ClientsTable items={filteredClients} />
          </DataSection>
        )}

        {active === "pagamentos" && (
          <DataSection
            title="Pagamentos"
            description="PIX criados e últimas movimentações financeiras."
          >
            <PaymentsTable items={data?.payments || []} />
          </DataSection>
        )}

        {active === "planos" && (
          <PlansEditor
            plans={plans}
            updatePlan={updatePlan}
            savePlans={savePlans}
            saving={savingPlans}
          />
        )}

        {active === "analytics" && (
          <Analytics data={data} />
        )}

        {active === "cupons" && (
          <CouponsManager
            coupons={coupons}
            plans={plans}
            editor={couponEditor}
            setEditor={setCouponEditor}
            saveCoupon={saveCoupon}
            deleteCoupon={deleteCoupon}
            saving={savingCoupon}
          />
        )}

        {active === "configuracoes" && (
          <ComingSoon
            title="Configurações"
            text="As configurações comerciais e integrações serão centralizadas aqui."
          />
        )}
      </section>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">✓</div>
            <h2>{modal.title}</h2>
            <p>{modal.text}</p>
            <button className="primary" onClick={() => setModal(null)}>Entendi</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Dashboard({ data, metrics, setActive }) {
  const chart = data?.chart || [];
  const maxChart = Math.max(...chart.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="dashboard-stack">
      <section className="welcome">
        <div>
          <span className="eyebrow">Visão geral do negócio</span>
          <h2>Bom dia, {data?.admin?.name?.split(" ")?.[0] || "Administrador"}.</h2>
          <p>Acompanhe vendas, clientes, pagamentos e campanhas em um só lugar.</p>
        </div>

        <div className={`first-sale ${data?.firstSale ? "completed" : ""}`}>
          <span>{data?.firstSale ? "Primeira venda realizada" : "Primeira venda"}</span>
          {data?.firstSale ? (
            <>
              <strong>{money(data.firstSale.amount)}</strong>
              <small>{data.firstSale.client} • {data.firstSale.plan}</small>
              <em>{date(data.firstSale.date, true)}</em>
            </>
          ) : (
            <>
              <strong>Aguardando...</strong>
              <small>O início oficial da história do Eterniza.</small>
            </>
          )}
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon="R$" value={money(metrics.revenueToday)} label="Receita hoje" detail="Pagamentos aprovados" />
        <Metric icon="↗" value={money(metrics.revenueMonth)} label="Receita do mês" detail="Mês atual" />
        <Metric icon="Σ" value={money(metrics.revenueTotal)} label="Receita total" detail={`Ticket médio ${money(metrics.averageTicket)}`} />
        <Metric icon="◉" value={metrics.clients || 0} label="Clientes" detail={`${metrics.clientsLast7Days || 0} nos últimos 7 dias`} />
      </section>

      <section className="business-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Financeiro</span><h3>Receita dos últimos 30 dias</h3></div>
            <strong>{money(metrics.revenueMonth)}</strong>
          </div>
          <div className="revenue-chart">
            {chart.map((item) => (
              <div key={item.date} title={`${item.label}: ${money(item.value)}`}>
                <span style={{ height: `${Math.max(5, (Number(item.value || 0) / maxChart) * 100)}%` }} />
                <small>{item.label.slice(0, 2)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel indicators">
          <div className="panel-heading"><div><span className="eyebrow">Indicadores</span><h3>Saúde do negócio</h3></div></div>
          <Indicator label="Plano mais vendido" value={metrics.bestPlan || "—"} />
          <Indicator label="Conversão em publicação" value={`${Number(metrics.conversion || 0).toFixed(1)}%`} />
          <Indicator label="PIX aprovados" value={metrics.approvedPayments || 0} />
          <Indicator label="PIX pendentes" value={metrics.pendingPayments || 0} />
          <Indicator label="Visualizações" value={Number(metrics.totalViews || 0).toLocaleString("pt-BR")} />
        </article>
      </section>

      <section className="metric-grid compact">
        <Metric icon="♥" value={metrics.published || 0} label="Publicadas" detail="Homenagens no ar" />
        <Metric icon="✎" value={metrics.drafts || 0} label="Rascunhos" detail="Em construção" />
        <Metric icon="◆" value={metrics.tributes || 0} label="Total de homenagens" detail="Todas as etapas" />
        <Metric icon="◎" value={metrics.activeClients || 0} label="Clientes ativos" detail="Com homenagem criada" />
      </section>

      <section className="business-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Movimentação</span><h3>Últimos pagamentos</h3></div>
            <button className="link-button" onClick={() => setActive("pagamentos")}>Ver todos</button>
          </div>
          <PaymentsTable items={data?.recentPayments || []} compact />
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading"><div><span className="eyebrow">Tempo real</span><h3>Atividade recente</h3></div></div>
          {(data?.activity || []).map((item, index) => (
            <div className="activity" key={`${item.type}-${index}`}>
              <span className={`activity-icon ${item.type}`}>{item.type === "payment" ? "R$" : item.type === "client" ? "◉" : "♥"}</span>
              <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              <time>{date(item.date, true)}</time>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

function Metric({ icon, value, label, detail }) {
  return (
    <article className="metric">
      <div className="metric-icon">{icon}</div>
      <div><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>
    </article>
  );
}

function Indicator({ label, value }) {
  return <div className="indicator"><span>{label}</span><strong>{value}</strong></div>;
}

function DataSection({ title, description, query, setQuery, children }) {
  return (
    <section className="section-stack">
      <div className="section-heading">
        <div><span className="eyebrow">Gestão</span><h2>{title}</h2><p>{description}</p></div>
        {setQuery && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar..."
          />
        )}
      </div>
      <div className="panel table-panel">{children}</div>
    </section>
  );
}

function TributesTable({ items }) {
  return (
    <div className="data-table">
      <div className="data-row header"><span>Homenagem</span><span>Cliente</span><span>Plano</span><span>Status</span><span>Visualizações</span><span>Data</span><span></span></div>
      {items.length ? items.map((item) => (
        <div className="data-row" key={item.id}>
          <span><b>{item.receiverName}</b><small>{item.senderName || "Sem remetente"}</small></span>
          <span><b>{item.userName || "Cliente"}</b><small>{item.userEmail}</small></span>
          <span>{item.planName || item.planId || "—"}</span>
          <span><em className={`status ${statusClass(item.status)}`}>{item.status}</em></span>
          <span>{item.views || 0}</span>
          <span>{date(item.createdAt)}</span>
          <span>{item.slug && <a href={`/presente/${item.slug}`} target="_blank" rel="noreferrer">Abrir</a>}</span>
        </div>
      )) : <p className="empty-state">Nenhuma homenagem encontrada.</p>}
    </div>
  );
}

function ClientsTable({ items }) {
  return (
    <div className="data-table clients-table">
      <div className="data-row header"><span>Cliente</span><span>WhatsApp</span><span>Homenagens</span><span>Cadastro</span></div>
      {items.length ? items.map((item) => (
        <div className="data-row" key={item.id}>
          <span><b>{item.name}</b><small>{item.email}</small></span>
          <span>{item.phone || "—"}</span>
          <span>{item.totalTributes || 0}</span>
          <span>{date(item.createdAt)}</span>
        </div>
      )) : <p className="empty-state">Nenhum cliente encontrado.</p>}
    </div>
  );
}

function PaymentsTable({ items, compact = false }) {
  return (
    <div className={`data-table payments-table ${compact ? "compact-table" : ""}`}>
      <div className="data-row header"><span>Cliente</span><span>Plano</span><span>Status</span><span>Valor</span><span>Data</span></div>
      {items.length ? items.map((item) => (
        <div className="data-row" key={item.id}>
          <span><b>{item.tribute?.user?.name || "Cliente"}</b><small>{item.tribute?.user?.email || ""}</small></span>
          <span>{item.tribute?.planName || "Plano"}</span>
          <span><em className={`status ${statusClass(item.status)}`}>{item.status}</em></span>
          <span><b>{money(item.amount)}</b></span>
          <span>{date(item.createdAt, true)}</span>
        </div>
      )) : <p className="empty-state">Nenhum pagamento encontrado.</p>}
    </div>
  );
}

function toEditablePlan(plan) {
  const dateInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  };

  return {
    slug: plan.slug,
    name: plan.name || "",
    description: plan.description || "",
    price: (Number(plan.originalPriceCents || plan.regularPriceCents || plan.priceCents || 0) / 100)
      .toFixed(2)
      .replace(".", ","),
    originalPrice: (Number(plan.originalPriceCents || plan.regularPriceCents || plan.priceCents || 0) / 100)
      .toFixed(2)
      .replace(".", ","),
    promoActive: Boolean(plan.configuredPromoActive ?? plan.promoActive),
    promoName: plan.promoName || "",
    promoPrice: plan.promoPriceCents
      ? (Number(plan.promoPriceCents) / 100).toFixed(2).replace(".", ",")
      : "",
    promoStartsAt: dateInput(plan.promoStartsAt),
    promoEndsAt: dateInput(plan.promoEndsAt),
    photos: Number(plan.photos || 1),
    duration: plan.duration || "vitalício",
    features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    sortOrder: Number(plan.sortOrder || 0),
    isActive: plan.isActive !== false,
  };
}

function PlansEditor({ plans, updatePlan, savePlans, saving }) {
  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Comercial</span>
          <h2>Planos e promoções</h2>
          <p>Altere valores, fotos, duração e campanhas sem deploy.</p>
        </div>
        <button className="primary" onClick={savePlans} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <div className="plans-grid">
        {plans.map((plan, index) => (
          <article className="plan-editor" key={plan.slug}>
            <div className="plan-editor-head">
              <div><span>{plan.slug}</span><h3>{plan.name}</h3></div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={plan.isActive}
                  onChange={(event) => updatePlan(index, "isActive", event.target.checked)}
                />
                <i></i>
                Ativo
              </label>
            </div>

            <label>Nome<input value={plan.name} onChange={(e) => updatePlan(index, "name", e.target.value)} /></label>
            <label>Descrição<textarea value={plan.description} onChange={(e) => updatePlan(index, "description", e.target.value)} /></label>

            <div className="field-grid">
              <label>Preço normal<input inputMode="decimal" value={plan.price} onChange={(e) => updatePlan(index, "price", e.target.value)} /></label>
              <label>Quantidade de fotos<input type="number" min="1" value={plan.photos} onChange={(e) => updatePlan(index, "photos", e.target.value)} /></label>
              <label>Duração<input value={plan.duration} onChange={(e) => updatePlan(index, "duration", e.target.value)} /></label>
              <label>Ordem<input type="number" value={plan.sortOrder} onChange={(e) => updatePlan(index, "sortOrder", e.target.value)} /></label>
            </div>

            <label>Recursos, um por linha<textarea value={plan.features} onChange={(e) => updatePlan(index, "features", e.target.value)} /></label>

            <div className="promo-box">
              <label className="switch promo-switch">
                <input
                  type="checkbox"
                  checked={plan.promoActive}
                  onChange={(event) => updatePlan(index, "promoActive", event.target.checked)}
                />
                <i></i>
                Ativar promoção
              </label>

              <label>Nome da campanha<input placeholder="Black Friday" value={plan.promoName} onChange={(e) => updatePlan(index, "promoName", e.target.value)} /></label>

              <div className="field-grid">
                <label>Preço promocional<input inputMode="decimal" placeholder="29,90" value={plan.promoPrice} onChange={(e) => updatePlan(index, "promoPrice", e.target.value)} /></label>
                <label>Início<input type="date" value={plan.promoStartsAt} onChange={(e) => updatePlan(index, "promoStartsAt", e.target.value)} /></label>
                <label>Fim<input type="date" value={plan.promoEndsAt} onChange={(e) => updatePlan(index, "promoEndsAt", e.target.value)} /></label>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


function emptyCoupon() {
  return {
    code: "",
    name: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    appliesToPlan: "*",
    startsAt: "",
    endsAt: "",
    maxUses: "",
    oncePerUser: false,
    isActive: true,
  };
}

function couponDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function editCoupon(coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name || "",
    description: coupon.description || "",
    discountType: coupon.discountType || "PERCENT",
    discountValue:
      coupon.discountType === "FIXED"
        ? (Number(coupon.discountValue || 0) / 100).toFixed(2).replace(".", ",")
        : String(coupon.discountValue || ""),
    appliesToPlan: coupon.appliesToPlan || "*",
    startsAt: couponDate(coupon.startsAt),
    endsAt: couponDate(coupon.endsAt),
    maxUses: coupon.maxUses ?? "",
    oncePerUser: Boolean(coupon.oncePerUser),
    isActive: coupon.isActive !== false,
  };
}

function CouponsManager({
  coupons,
  plans,
  editor,
  setEditor,
  saveCoupon,
  deleteCoupon,
  saving,
}) {
  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Campanhas</span>
          <h2>Cupons de desconto</h2>
          <p>Crie campanhas, limite usos e aplique descontos no PIX.</p>
        </div>
        <button className="primary" onClick={() => setEditor(emptyCoupon())}>
          + Novo cupom
        </button>
      </div>

      {editor && (
        <CouponEditor
          value={editor}
          setValue={setEditor}
          plans={plans}
          onSave={saveCoupon}
          onCancel={() => setEditor(null)}
          saving={saving}
        />
      )}

      <div className="coupon-admin-grid">
        {coupons.length ? coupons.map((coupon) => (
          <article className="coupon-admin-card" key={coupon.id}>
            <div className="coupon-admin-head">
              <div>
                <span>{coupon.isActive ? "Ativo" : "Inativo"}</span>
                <h3>{coupon.code}</h3>
              </div>
              <strong>
                {coupon.discountType === "PERCENT"
                  ? `${coupon.discountValue}%`
                  : money(Number(coupon.discountValue || 0) / 100)}
              </strong>
            </div>

            <p>{coupon.name || coupon.description || "Cupom promocional"}</p>

            <div className="coupon-admin-meta">
              <span>Plano <b>{coupon.appliesToPlan === "*" ? "Todos" : coupon.appliesToPlan}</b></span>
              <span>Usos <b>{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</b></span>
              <span>Validade <b>{coupon.endsAt ? date(coupon.endsAt) : "Sem validade"}</b></span>
              <span>Por cliente <b>{coupon.oncePerUser ? "Uma vez" : "Livre"}</b></span>
            </div>

            <div className="coupon-admin-actions">
              <button onClick={() => setEditor(editCoupon(coupon))}>Editar</button>
              <button className="danger-button" onClick={() => deleteCoupon(coupon.id)}>
                {coupon.usedCount > 0 ? "Desativar" : "Excluir"}
              </button>
            </div>
          </article>
        )) : (
          <div className="coming-soon">
            <span>Nenhum cupom</span>
            <h2>Crie sua primeira campanha.</h2>
            <p>O cupom aparecerá no checkout assim que estiver ativo.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CouponEditor({ value, setValue, plans, onSave, onCancel, saving }) {
  const update = (field, fieldValue) =>
    setValue((current) => ({ ...current, [field]: fieldValue }));

  return (
    <article className="coupon-editor">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{value.id ? "Editar cupom" : "Novo cupom"}</span>
          <h3>{value.code || "Campanha promocional"}</h3>
        </div>
      </div>

      <div className="coupon-form-grid">
        <label>Código<input value={value.code} onChange={(e) => update("code", e.target.value.toUpperCase())} placeholder="BLACK20" /></label>
        <label>Nome da campanha<input value={value.name} onChange={(e) => update("name", e.target.value)} placeholder="Black Friday" /></label>
        <label>Tipo de desconto<select value={value.discountType} onChange={(e) => update("discountType", e.target.value)}><option value="PERCENT">Percentual</option><option value="FIXED">Valor fixo</option></select></label>
        <label>Desconto<input inputMode="decimal" value={value.discountValue} onChange={(e) => update("discountValue", e.target.value.replace(",", "."))} placeholder={value.discountType === "PERCENT" ? "20" : "10,00"} /></label>
        <label>Plano<select value={value.appliesToPlan} onChange={(e) => update("appliesToPlan", e.target.value)}><option value="*">Todos os planos</option>{plans.map((plan) => <option key={plan.slug} value={plan.slug}>{plan.name}</option>)}</select></label>
        <label>Máximo de usos<input type="number" min="1" value={value.maxUses} onChange={(e) => update("maxUses", e.target.value)} placeholder="Sem limite" /></label>
        <label>Início<input type="date" value={value.startsAt} onChange={(e) => update("startsAt", e.target.value)} /></label>
        <label>Fim<input type="date" value={value.endsAt} onChange={(e) => update("endsAt", e.target.value)} /></label>
      </div>

      <label>Descrição<textarea value={value.description} onChange={(e) => update("description", e.target.value)} placeholder="Campanha especial de Black Friday." /></label>

      <div className="coupon-switches">
        <label className="switch"><input type="checkbox" checked={value.oncePerUser} onChange={(e) => update("oncePerUser", e.target.checked)} /><i></i>Uma utilização por cliente</label>
        <label className="switch"><input type="checkbox" checked={value.isActive} onChange={(e) => update("isActive", e.target.checked)} /><i></i>Cupom ativo</label>
      </div>

      <div className="coupon-editor-actions">
        <button onClick={onCancel}>Cancelar</button>
        <button className="primary" onClick={() => onSave(value)} disabled={saving}>
          {saving ? "Salvando..." : "Salvar cupom"}
        </button>
      </div>
    </article>
  );
}

function Analytics({ data }) {
  const metrics = data?.metrics || {};
  return (
    <section className="section-stack">
      <div className="section-heading"><div><span className="eyebrow">Dados</span><h2>Analytics</h2><p>Indicadores reais de uso e conversão.</p></div></div>
      <div className="metric-grid">
        <Metric icon="◎" value={Number(metrics.totalViews || 0).toLocaleString("pt-BR")} label="Visualizações" detail="Em todas as homenagens" />
        <Metric icon="%" value={`${Number(metrics.conversion || 0).toFixed(1)}%`} label="Conversão" detail="Publicadas sobre criadas" />
        <Metric icon="♥" value={metrics.published || 0} label="Publicadas" detail="Páginas no ar" />
        <Metric icon="◉" value={metrics.activeClients || 0} label="Clientes ativos" detail="Com homenagem criada" />
      </div>
    </section>
  );
}

function ComingSoon({ title, text }) {
  return (
    <section className="coming-soon">
      <span>Próxima sprint</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function sectionTitle(active) {
  const found = menu.find(([id]) => id === active);
  return found?.[2] || "Dashboard";
}

function Style() {
  return (
    <style>{`
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0}
.admin-page{min-height:100vh;background:radial-gradient(circle at 70% -10%,rgba(239,189,82,.13),transparent 35%),#050807;color:#f9f5ec;font-family:Inter,Segoe UI,Arial,sans-serif;display:grid;grid-template-columns:270px 1fr}
.sidebar{height:100vh;position:sticky;top:0;padding:24px 18px;border-right:1px solid rgba(239,189,82,.14);background:rgba(4,8,7,.88);display:flex;flex-direction:column}
.admin-brand{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none;padding:0 8px 22px;border-bottom:1px solid rgba(255,255,255,.07)}
.admin-brand img{width:52px;height:52px;object-fit:contain}.admin-brand strong{display:block;color:#efbd52;font:700 22px Georgia,serif}.admin-brand span{display:block;color:#9f978a;font-size:12px;margin-top:3px}
.sidebar nav{display:grid;gap:7px;margin-top:20px}.sidebar nav button{border:0;background:transparent;color:#cfc8bc;min-height:48px;border-radius:13px;padding:0 12px;display:grid;grid-template-columns:28px 1fr auto;align-items:center;text-align:left;cursor:pointer}.sidebar nav button b{font-size:14px}.sidebar nav button em{font-size:9px;color:#8d8578;text-transform:uppercase;font-style:normal}.sidebar nav button.active{background:linear-gradient(90deg,rgba(239,189,82,.16),rgba(239,189,82,.04));color:#fff3d5;box-shadow:inset 3px 0 #efbd52}
.sidebar-footer{margin-top:auto;border-top:1px solid rgba(255,255,255,.07);padding:18px 8px 0}.sidebar-footer small{display:block;color:#817b71;margin-bottom:10px}.sidebar-footer button{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;border-radius:12px;padding:11px;cursor:pointer}
.workspace{min-width:0;padding:28px 32px 50px}.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.topbar h1{font:700 34px Georgia,serif;margin:5px 0 0}.eyebrow{color:#d8a94a;text-transform:uppercase;letter-spacing:.13em;font-size:10px;font-weight:1000}.admin-user{display:flex;align-items:center;gap:11px}.avatar{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#171005;display:grid;place-items:center;font-weight:1000}.admin-user strong,.admin-user span{display:block}.admin-user span{font-size:12px;color:#8dffb2;margin-top:3px}
.dashboard-stack,.section-stack{display:grid;gap:18px}.welcome,.panel,.metric,.section-heading,.plan-editor,.coming-soon{border:1px solid rgba(239,189,82,.13);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.22)}
.welcome{padding:28px;display:flex;justify-content:space-between;gap:25px;align-items:center}.welcome h2{font:700 36px Georgia,serif;margin:8px 0}.welcome p{color:#bdb5a8;margin:0}.first-sale{min-width:300px;border:1px dashed rgba(239,189,82,.28);border-radius:18px;padding:17px}.first-sale.completed{border-style:solid;background:rgba(75,188,115,.07)}.first-sale span,.first-sale small,.first-sale em{display:block}.first-sale span{color:#efbd52;font-weight:900}.first-sale strong{display:block;font-size:26px;margin:5px 0}.first-sale small{color:#c8c0b2}.first-sale em{font-size:11px;color:#8f887e;margin-top:7px;font-style:normal}
.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.metric{padding:20px;display:flex;align-items:center;gap:14px}.metric-icon{width:46px;height:46px;border-radius:14px;background:rgba(239,189,82,.1);border:1px solid rgba(239,189,82,.16);display:grid;place-items:center;color:#efbd52;font-weight:1000}.metric strong,.metric span,.metric small{display:block}.metric strong{font-size:24px}.metric span{color:#efbd52;font-weight:900;margin-top:3px}.metric small{color:#8f887e;margin-top:3px}
.business-grid{display:grid;grid-template-columns:1.55fr .85fr;gap:18px}.panel{padding:22px}.panel-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}.panel-heading h3{font:700 23px Georgia,serif;margin:5px 0 0}.panel-heading>strong{font-size:22px;color:#efbd52}.link-button{border:0;background:transparent;color:#efbd52;font-weight:900;cursor:pointer}
.revenue-chart{height:230px;display:flex;align-items:end;gap:5px;padding-top:20px}.revenue-chart>div{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:7px}.revenue-chart span{width:100%;min-height:5px;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,#f7dc82,#a97124)}.revenue-chart small{font-size:8px;color:#777168}
.indicators{display:grid;align-content:start}.indicator{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-top:1px solid rgba(255,255,255,.07)}.indicator span{color:#9e978c}.indicator strong{color:#f5e3bd}
.activity{display:grid;grid-template-columns:42px 1fr auto;gap:11px;align-items:center;padding:11px 0;border-top:1px solid rgba(255,255,255,.06)}.activity:first-of-type{border-top:0}.activity-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(239,189,82,.09);color:#efbd52;font-size:12px;font-weight:1000}.activity strong,.activity small{display:block}.activity small{color:#8f887e;margin-top:3px}.activity time{font-size:10px;color:#777168}
.section-heading{padding:24px;display:flex;justify-content:space-between;align-items:center;gap:20px}.section-heading h2{font:700 34px Georgia,serif;margin:6px 0}.section-heading p{color:#9e978c;margin:0}.section-heading input{width:min(340px,100%);border:1px solid rgba(239,189,82,.16);background:rgba(255,255,255,.04);color:#fff;border-radius:13px;padding:13px}
.table-panel{overflow:auto}.data-table{min-width:780px}.data-row{display:grid;grid-template-columns:1.35fr 1.2fr .8fr .8fr .65fr .75fr .45fr;gap:12px;align-items:center;padding:13px 4px;border-top:1px solid rgba(255,255,255,.065)}.data-row.header{border-top:0;color:#847e75;text-transform:uppercase;font-size:10px;font-weight:1000}.data-row b,.data-row small{display:block}.data-row small{color:#8f887e;margin-top:3px}.data-row a{color:#efbd52;font-weight:900}.clients-table .data-row{grid-template-columns:1.5fr 1fr .7fr .8fr}.payments-table .data-row{grid-template-columns:1.4fr .8fr .7fr .7fr .9fr}.status{display:inline-flex;border-radius:999px;padding:6px 9px;font-style:normal;font-size:10px;font-weight:1000;text-transform:uppercase}.status.success{background:rgba(69,194,113,.12);color:#8dffb2}.status.pending{background:rgba(239,189,82,.11);color:#f3cf7d}.status.danger{background:rgba(255,78,78,.1);color:#ffaaaa}.empty-state{color:#8f887e;padding:20px}
.plans-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.plan-editor{padding:20px}.plan-editor-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:15px}.plan-editor-head span{color:#8c857a;text-transform:uppercase;font-size:10px}.plan-editor-head h3{font:700 26px Georgia,serif;margin:4px 0}.plan-editor label{display:grid;gap:6px;color:#cdbf9d;font-size:12px;font-weight:900;margin:11px 0}.plan-editor input,.plan-editor textarea{width:100%;border:1px solid rgba(239,189,82,.15);background:rgba(255,255,255,.04);color:#fff;border-radius:11px;padding:11px}.plan-editor textarea{min-height:86px;resize:vertical}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.promo-box{margin-top:16px;padding:15px;border-radius:15px;background:rgba(239,189,82,.055);border:1px solid rgba(239,189,82,.11)}.switch{display:flex!important;grid-template-columns:none!important;align-items:center;gap:8px!important}.switch input{display:none}.switch i{width:36px;height:20px;background:#2b302d;border-radius:999px;position:relative}.switch i:after{content:"";position:absolute;width:14px;height:14px;border-radius:50%;background:#aaa;top:3px;left:3px;transition:.2s}.switch input:checked+i{background:#92702c}.switch input:checked+i:after{left:19px;background:#ffe094}
.primary{border:0;border-radius:13px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#171005;font-weight:1000;padding:13px 18px;cursor:pointer}.primary:disabled{opacity:.6}.coming-soon{padding:50px;text-align:center}.coming-soon span{color:#efbd52;text-transform:uppercase;letter-spacing:.12em}.coming-soon h2{font:700 42px Georgia,serif;margin:12px}.coming-soon p{color:#aaa194;max-width:580px;margin:auto}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:grid;place-items:center;padding:20px;z-index:100}.modal-card{width:min(460px,96vw);border:1px solid rgba(239,189,82,.26);background:#0d1311;border-radius:22px;padding:28px;text-align:center}.modal-icon{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;margin:auto;background:rgba(69,194,113,.13);color:#8dffb2;font-size:28px}.modal-card h2{font:700 31px Georgia,serif}.modal-card p{color:#aaa194;line-height:1.5}
.admin-loading-page{min-height:100vh;background:radial-gradient(circle at 50% 35%,rgba(239,189,82,.12),transparent 28%),#050807;display:flex;align-items:center;justify-content:center;padding:24px;color:#f9f5ec;font-family:Inter,Segoe UI,Arial,sans-serif}
.admin-loading-card{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px}
.admin-loading-card strong{font:700 24px Georgia,serif;color:#fff3d5;margin-top:8px}
.admin-loading-card span{color:#8f887e;font-size:13px}
.loading,.locked{display:grid;place-items:center}.loader{width:78px;height:78px;border-radius:24px;border:1px solid rgba(239,189,82,.3);display:grid;place-items:center;color:#efbd52;font:700 48px Georgia,serif;box-shadow:0 0 45px rgba(239,189,82,.12);animation:adminPulse 1.4s ease-in-out infinite}.locked{text-align:center}.locked img{width:140px}.locked h1{font:700 48px Georgia,serif;margin:12px}.locked p{color:#aaa194}.locked a{margin-top:10px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#171005;padding:14px 20px;border-radius:13px;text-decoration:none;font-weight:1000}
@keyframes adminPulse{0%,100%{transform:scale(1);opacity:.82}50%{transform:scale(1.06);opacity:1}}

.coupon-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.coupon-admin-card,.coupon-editor{border:1px solid rgba(239,189,82,.13);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.22);padding:20px}
.coupon-admin-head{display:flex;justify-content:space-between;gap:12px}.coupon-admin-head span{font-size:10px;text-transform:uppercase;color:#8dffb2}.coupon-admin-head h3{font:700 29px Georgia,serif;margin:5px 0}.coupon-admin-head>strong{color:#efbd52;font-size:25px}.coupon-admin-card>p{color:#aaa194}
.coupon-admin-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}.coupon-admin-meta span{background:rgba(255,255,255,.035);border-radius:11px;padding:10px;color:#8f887e;font-size:11px}.coupon-admin-meta b{display:block;color:#fff3d5;margin-top:4px}
.coupon-admin-actions,.coupon-editor-actions{display:flex;gap:8px;justify-content:flex-end}.coupon-admin-actions button,.coupon-editor-actions button{border:1px solid rgba(239,189,82,.16);background:rgba(255,255,255,.04);color:#fff;border-radius:11px;padding:10px 13px;font-weight:900;cursor:pointer}.danger-button{color:#ffb1b1!important;border-color:rgba(255,80,80,.2)!important}
.coupon-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.coupon-editor label{display:grid;gap:6px;color:#cdbf9d;font-size:12px;font-weight:900;margin:10px 0}.coupon-editor input,.coupon-editor select,.coupon-editor textarea{width:100%;border:1px solid rgba(239,189,82,.15);background:#101513;color:#fff;border-radius:11px;padding:11px}.coupon-editor textarea{min-height:82px}.coupon-switches{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0 18px}
@media(max-width:1180px){.admin-page{grid-template-columns:220px 1fr}.metric-grid,.plans-grid{grid-template-columns:1fr 1fr}.business-grid{grid-template-columns:1fr}}
@media(max-width:980px){.coupon-admin-grid{grid-template-columns:1fr 1fr}.coupon-form-grid{grid-template-columns:1fr 1fr}}
@media(max-width:760px){.coupon-admin-grid,.coupon-form-grid{grid-template-columns:1fr}.admin-page{display:block}.sidebar{height:auto;position:static}.sidebar nav{grid-template-columns:1fr 1fr}.sidebar-footer{display:none}.workspace{padding:20px 14px}.topbar,.welcome,.section-heading{align-items:flex-start;flex-direction:column}.metric-grid,.plans-grid{grid-template-columns:1fr}.first-sale{min-width:0;width:100%}.field-grid{grid-template-columns:1fr}}
`}</style>
  );
}
