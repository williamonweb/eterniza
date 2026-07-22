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
  ["pets", "🐾", "Eterniza Pets"],
  ["pets-finance", "R$", "Financeiro Pets"],
  ["configuracoes", "⚙", "Configurações"],
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
  const [settings, setSettings] = useState(null);
  const [settingsTab, setSettingsTab] = useState("general");
  const [savingSettings, setSavingSettings] = useState(false);
  const [petClinics, setPetClinics] = useState([]);
  const [petEditor, setPetEditor] = useState(null);
  const [savingClinic, setSavingClinic] = useState(false);
  const [petFinance, setPetFinance] = useState({ invoices: [], clinics: [], metrics: {} });
  const [financeEditor, setFinanceEditor] = useState(null);
  const [savingFinance, setSavingFinance] = useState(false);

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

      const [dashboardRes, plansRes, couponsRes, settingsRes, petsRes, financeRes] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/plans", { cache: "no-store" }),
        fetch("/api/admin/coupons", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/pets/clinics", { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/pets/finance", { cache: "no-store" }).catch(() => null),
      ]);

      const dashboardData = await dashboardRes.json().catch(() => ({}));
      const plansData = await plansRes.json().catch(() => ({}));
      const couponsData = await couponsRes.json().catch(() => ({}));
      const settingsData = await settingsRes.json().catch(() => ({}));
      const petsData = petsRes ? await petsRes.json().catch(() => ({})) : {};
      const financeData = financeRes ? await financeRes.json().catch(() => ({})) : {};

      if (dashboardData?.ok) setData(dashboardData);
      if (plansData?.ok && Array.isArray(plansData.plans)) {
        setPlans(plansData.plans.map(toEditablePlan));
      }
      if (couponsData?.ok && Array.isArray(couponsData.coupons)) {
        setCoupons(couponsData.coupons);
      }
      if (settingsData?.ok && settingsData.settings) {
        setSettings(settingsData.settings);
      }
      if (petsData?.ok && Array.isArray(petsData.clinics)) setPetClinics(petsData.clinics);
      if (financeData?.ok) setPetFinance({ invoices: financeData.invoices || [], clinics: financeData.clinics || [], metrics: financeData.metrics || {} });
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



  async function updatePetClinic(payload) {
    setSavingClinic(true);
    try {
      const response = await fetch("/api/admin/pets/clinics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível atualizar a clínica.");
      setPetEditor(null);
      await load();
      setModal({ title: "Eterniza Pets", text: result.message || "Clínica atualizada." });
    } catch (error) {
      setModal({ title: "Erro na clínica", text: error.message || "Não foi possível atualizar." });
    } finally {
      setSavingClinic(false);
    }
  }

  async function savePetInvoice(payload) {
    setSavingFinance(true);
    try {
      const response = await fetch("/api/admin/pets/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível criar a mensalidade.");
      setFinanceEditor(null);
      await load();
      setModal({ title: "Mensalidade criada", text: result.message || "A cobrança foi registrada." });
    } catch (error) {
      setModal({ title: "Erro no financeiro", text: error.message || "Não foi possível criar a mensalidade." });
    } finally {
      setSavingFinance(false);
    }
  }

  async function updatePetInvoice(payload) {
    setSavingFinance(true);
    try {
      const response = await fetch("/api/admin/pets/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível atualizar a cobrança.");
      await load();
      setModal({ title: "Financeiro atualizado", text: result.message || "Cobrança atualizada." });
    } catch (error) {
      setModal({ title: "Erro no financeiro", text: error.message || "Não foi possível atualizar a cobrança." });
    } finally {
      setSavingFinance(false);
    }
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...(current || {}), [key]: value }));
  }

  async function saveSettings() {
    if (!settings) return;

    setSavingSettings(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Não foi possível salvar as configurações.");
      }

      setSettings(result.settings);
      setModal({
        title: "Configurações atualizadas",
        text: "As alterações já estão disponíveis na landing e no sistema.",
      });
    } catch (error) {
      setModal({
        title: "Erro ao salvar",
        text: error.message || "Não foi possível salvar as configurações.",
      });
    } finally {
      setSavingSettings(false);
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

        {active === "pets" && (
          <PetsAdmin
            clinics={petClinics}
            editor={petEditor}
            setEditor={setPetEditor}
            updateClinic={updatePetClinic}
            saving={savingClinic}
          />
        )}

        {active === "pets-finance" && (
          <PetsFinance
            data={petFinance}
            editor={financeEditor}
            setEditor={setFinanceEditor}
            onCreate={savePetInvoice}
            onUpdate={updatePetInvoice}
            saving={savingFinance}
          />
        )}

        {active === "configuracoes" && (
          <SettingsManager
            settings={settings}
            activeTab={settingsTab}
            setActiveTab={setSettingsTab}
            updateSetting={updateSetting}
            saveSettings={saveSettings}
            saving={savingSettings}
            metrics={metrics}
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



function PetsAdmin({ clinics, editor, setEditor, updateClinic, saving }) {
  const pending = clinics.filter((clinic) => clinic.status === "PENDING");
  const active = clinics.filter((clinic) => clinic.status === "APPROVED");
  const projected = active.reduce((sum, clinic) => sum + Number(clinic.monthlyPriceCents || 0), 0) / 100;

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div><span className="eyebrow">B2B Veterinário</span><h2>Eterniza Pets</h2><p>Aprove clínicas e configure os pacotes mensais.</p></div>
      </div>

      <div className="metric-grid">
        <Metric icon="⏳" value={pending.length} label="Solicitações" detail="Aguardando análise" />
        <Metric icon="🐾" value={active.length} label="Clínicas ativas" detail="Acesso liberado" />
        <Metric icon="R$" value={money(projected)} label="Receita prevista" detail="Pacotes ativos" />
        <Metric icon="Σ" value={clinics.length} label="Total de cadastros" detail="Todos os status" />
      </div>

      <div className="pets-admin-grid">
        {clinics.map((clinic) => (
          <article className="pet-clinic-card" key={clinic.id}>
            <div className="pet-clinic-head">
              <div><span>{clinic.code}</span><h3>{clinic.tradeName}</h3><small>{clinic.legalName}</small></div>
              <em className={`status ${statusClass(clinic.status)}`}>{clinic.status}</em>
            </div>
            <div className="pet-clinic-meta">
              <span>CNPJ <b>{clinic.cnpj}</b></span>
              <span>Responsável <b>{clinic.responsibleName}</b></span>
              <span>Contato <b>{clinic.responsibleEmail}</b></span>
              <span>Unidades <b>{clinic.unitsCount}</b></span>
              <span>Pacote <b>{clinic.monthlyPackageName}</b></span>
              <span>Valor <b>{clinic.monthlyPriceCents ? money(clinic.monthlyPriceCents / 100) : "A definir"}</b></span>
            </div>
            {clinic.rejectionReason && <p className="rejection">{clinic.rejectionReason}</p>}
            <div className="pet-clinic-actions">
              <button onClick={() => setEditor({
                ...clinic,
                monthlyPrice: clinic.monthlyPriceCents ? (clinic.monthlyPriceCents / 100).toFixed(2).replace(".", ",") : "",
              })}>Ver e configurar</button>
              {clinic.status === "PENDING" && <button className="primary" onClick={() => setEditor({
                ...clinic,
                monthlyPrice: "",
                approveMode: true,
              })}>Analisar</button>}
              {clinic.status === "APPROVED" && <button className="danger-button" onClick={() => updateClinic({ id: clinic.id, action: "SUSPEND" })}>Suspender</button>}
              {clinic.status === "SUSPENDED" && <button className="primary" onClick={() => updateClinic({ id: clinic.id, action: "REACTIVATE" })}>Reativar</button>}
            </div>
          </article>
        ))}
        {!clinics.length && <div className="coming-soon"><span>Eterniza Pets</span><h2>Nenhuma clínica cadastrada.</h2><p>As solicitações aparecerão aqui.</p></div>}
      </div>

      {editor && <PetClinicModal clinic={editor} setClinic={setEditor} onClose={() => setEditor(null)} onSave={updateClinic} saving={saving} />}
    </section>
  );
}

function PetClinicModal({ clinic, setClinic, onClose, onSave, saving }) {
  const update = (key, value) => setClinic((current) => ({ ...current, [key]: value }));
  const cents = Math.round(Number(String(clinic.monthlyPrice || "0").replace(",", ".")) * 100);

  return <div className="modal-overlay">
    <div className="pet-modal">
      <div className="panel-heading"><div><span className="eyebrow">{clinic.code}</span><h3>{clinic.tradeName}</h3></div><button onClick={onClose}>×</button></div>
      <div className="clinic-detail-grid">
        <span>Razão social<b>{clinic.legalName}</b></span><span>CNPJ<b>{clinic.cnpj}</b></span>
        <span>E-mail<b>{clinic.email}</b></span><span>Telefone<b>{clinic.phone}</b></span>
        <span>Responsável<b>{clinic.responsibleName}</b></span><span>Cargo<b>{clinic.responsibleRole || "—"}</b></span>
        <span>Cidade<b>{clinic.city || "—"} / {clinic.state || "—"}</b></span><span>Estimativa mensal<b>{clinic.estimatedMonthlyUses ?? "—"}</b></span>
      </div>
      <div className="coupon-form-grid">
        <label>Nome do pacote<input value={clinic.monthlyPackageName || ""} onChange={(e) => update("monthlyPackageName", e.target.value)} /></label>
        <label>Valor mensal<input inputMode="decimal" value={clinic.monthlyPrice || ""} onChange={(e) => update("monthlyPrice", e.target.value)} placeholder="299,00" /></label>
        <label>Limite mensal<input type="number" min="0" value={clinic.monthlyTributeLimit || 0} onChange={(e) => update("monthlyTributeLimit", Number(e.target.value))} /></label>
        <label>Dia de vencimento<input type="number" min="1" max="28" value={clinic.billingDay || 10} onChange={(e) => update("billingDay", Number(e.target.value))} /></label>
      </div>
      <div className="coupon-switches">
        <label className="switch"><input type="checkbox" checked={clinic.showEternizaBrand !== false} onChange={(e) => update("showEternizaBrand", e.target.checked)} /><i></i>Mostrar logo Eterniza junto ao logo da clínica</label>
        <label className="switch"><input type="checkbox" checked={clinic.showEternizaCta !== false} onChange={(e) => update("showEternizaCta", e.target.checked)} /><i></i>Mostrar “Conheça o Eterniza” no final</label>
      </div>
      <div className="coupon-form-grid">
        <label>Texto do botão<input value={clinic.eternizaCtaText || "Conheça o Eterniza"} onChange={(e) => update("eternizaCtaText", e.target.value)} /></label>
        <label>Link do botão<input value={clinic.eternizaCtaUrl || "https://eternizas.com.br"} onChange={(e) => update("eternizaCtaUrl", e.target.value)} /></label>
      </div>
      <div className="coupon-editor-actions">
        {clinic.status === "PENDING" && <button className="danger-button" onClick={() => onSave({ id: clinic.id, action: "REJECT", reason: "Cadastro não aprovado pela administração." })}>Recusar</button>}
        <button onClick={onClose}>Cancelar</button>
        <button className="primary" disabled={saving} onClick={() => onSave({
          id: clinic.id,
          action: clinic.status === "PENDING" ? "APPROVE" : "UPDATE",
          monthlyPackageName: clinic.monthlyPackageName,
          monthlyPriceCents: cents,
          monthlyTributeLimit: Number(clinic.monthlyTributeLimit || 0),
          billingDay: Number(clinic.billingDay || 10),
          showEternizaBrand: clinic.showEternizaBrand,
          showEternizaCta: clinic.showEternizaCta,
          eternizaCtaText: clinic.eternizaCtaText,
          eternizaCtaUrl: clinic.eternizaCtaUrl,
        })}>{saving ? "Salvando..." : clinic.status === "PENDING" ? "Aprovar e liberar acesso" : "Salvar configurações"}</button>
      </div>
    </div>
  </div>;
}

function PetsFinance({ data, editor, setEditor, onCreate, onUpdate, saving }) {
  const invoices = data?.invoices || [];
  const clinics = data?.clinics || [];
  const metrics = data?.metrics || {};
  const currentCompetency = new Date().toISOString().slice(0, 7);

  function openNew() {
    const first = clinics[0];
    setEditor({
      clinicId: first?.id || "",
      competency: currentCompetency,
      amount: first ? (Number(first.monthlyPriceCents || 0) / 100).toFixed(2).replace(".", ",") : "",
      dueDate: "",
      description: first?.monthlyPackageName ? `Mensalidade ${first.monthlyPackageName}` : "Mensalidade Eterniza Pets",
      notes: "",
    });
  }

  function chooseClinic(id) {
    const clinic = clinics.find((item) => item.id === id);
    setEditor((current) => ({
      ...current,
      clinicId: id,
      amount: clinic ? (Number(clinic.monthlyPriceCents || 0) / 100).toFixed(2).replace(".", ",") : current.amount,
      description: clinic?.monthlyPackageName ? `Mensalidade ${clinic.monthlyPackageName}` : current.description,
    }));
  }

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div><span className="eyebrow">Mensalidades das clínicas</span><h2>Financeiro Eterniza Pets</h2><p>Controle pagamentos mensais e emita recibos profissionais.</p></div>
        <button className="primary" onClick={openNew} disabled={!clinics.length}>+ Nova mensalidade</button>
      </div>

      <div className="metric-grid">
        <Metric icon="✓" value={money(Number(metrics.monthReceivedCents || 0) / 100)} label="Recebido no mês" detail={`${metrics.paidCount || 0} pagamentos confirmados`} />
        <Metric icon="⌛" value={money(Number(metrics.pendingCents || 0) / 100)} label="A receber" detail={`${metrics.pendingCount || 0} mensalidades pendentes`} />
        <Metric icon="!" value={money(Number(metrics.overdueCents || 0) / 100)} label="Em atraso" detail={`${metrics.overdueCount || 0} cobranças vencidas`} />
        <Metric icon="Σ" value={money(Number(metrics.receivedCents || 0) / 100)} label="Total recebido" detail="Histórico de mensalidades" />
      </div>

      <div className="panel table-panel finance-table">
        <div className="finance-row header"><span>Clínica</span><span>Competência</span><span>Vencimento</span><span>Valor</span><span>Status</span><span>Pagamento</span><span>Ações</span></div>
        {invoices.map((invoice) => (
          <div className="finance-row" key={invoice.id}>
            <div><b>{invoice.clinic?.tradeName}</b><small>{invoice.clinic?.cnpj}</small></div>
            <span>{formatCompetency(invoice.competency)}</span>
            <span>{date(invoice.dueDate)}</span>
            <b>{money(Number(invoice.amountCents || 0) / 100)}</b>
            <em className={`status ${statusClass(invoice.status)}`}>{financeStatus(invoice.status)}</em>
            <span>{invoice.paidAt ? `${date(invoice.paidAt)} · ${invoice.paymentMethod || "PIX"}` : "—"}</span>
            <div className="finance-actions">
              {invoice.status === "PAID" ? <>
                <a href={`/admin/pets/finance/receipts/${invoice.id}`} target="_blank" rel="noreferrer">Recibo</a>
                <button disabled={saving} onClick={() => onUpdate({ id: invoice.id, action: "REOPEN" })}>Reabrir</button>
              </> : invoice.status !== "CANCELLED" ? <>
                <button className="confirm" disabled={saving} onClick={() => onUpdate({ id: invoice.id, action: "MARK_PAID", paymentMethod: "PIX" })}>Marcar pago</button>
                <button disabled={saving} onClick={() => onUpdate({ id: invoice.id, action: "CANCEL" })}>Cancelar</button>
              </> : <span>Cancelada</span>}
            </div>
          </div>
        ))}
        {!invoices.length && <div className="empty-state">Nenhuma mensalidade registrada. Clique em “Nova mensalidade” para começar.</div>}
      </div>

      {editor && <div className="modal-overlay">
        <div className="finance-modal">
          <div className="panel-heading"><div><span className="eyebrow">Nova cobrança</span><h3>Mensalidade da clínica</h3></div><button onClick={() => setEditor(null)}>×</button></div>
          <div className="finance-form-grid">
            <label>Clínica<select value={editor.clinicId} onChange={(e) => chooseClinic(e.target.value)}><option value="">Selecione</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.tradeName}</option>)}</select></label>
            <label>Competência<input type="month" value={editor.competency} onChange={(e) => setEditor((current) => ({ ...current, competency: e.target.value }))} /></label>
            <label>Valor mensal<input inputMode="decimal" value={editor.amount} onChange={(e) => setEditor((current) => ({ ...current, amount: e.target.value }))} placeholder="299,00" /></label>
            <label>Vencimento opcional<input type="date" value={editor.dueDate} onChange={(e) => setEditor((current) => ({ ...current, dueDate: e.target.value }))} /></label>
            <label className="wide">Descrição<input value={editor.description} onChange={(e) => setEditor((current) => ({ ...current, description: e.target.value }))} /></label>
            <label className="wide">Observações<textarea value={editor.notes} onChange={(e) => setEditor((current) => ({ ...current, notes: e.target.value }))} /></label>
          </div>
          <div className="coupon-editor-actions"><button onClick={() => setEditor(null)}>Cancelar</button><button className="primary" disabled={saving || !editor.clinicId || !editor.competency} onClick={() => onCreate({ clinicId: editor.clinicId, competency: editor.competency, amountCents: Math.round(Number(String(editor.amount || "0").replace(",", ".")) * 100), dueDate: editor.dueDate || undefined, description: editor.description, notes: editor.notes })}>{saving ? "Salvando..." : "Criar mensalidade"}</button></div>
        </div>
      </div>}
    </section>
  );
}

function financeStatus(status) {
  return ({ PAID: "Pago", PENDING: "Pendente", OVERDUE: "Atrasado", CANCELLED: "Cancelado" })[status] || status;
}

function formatCompetency(value) {
  const [year, month] = String(value || "").split("-");
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return month && year ? `${names[Number(month) - 1]}/${year}` : value || "—";
}

function SettingsManager({
  settings,
  activeTab,
  setActiveTab,
  updateSetting,
  saveSettings,
  saving,
  metrics,
}) {
  if (!settings) {
    return <section className="coming-soon"><span>Configurações</span><h2>Carregando...</h2></section>;
  }

  const tabs = [
    ["general", "Geral"],
    ["landing", "Landing"],
    ["commercial", "Comercial"],
    ["payments", "Pagamentos"],
    ["music", "Música"],
    ["upload", "Upload"],
    ["ai", "IA"],
    ["whatsapp", "WhatsApp"],
    ["emails", "E-mails"],
  ];

  const monthlyGoal = Number(settings.monthlyRevenueGoal || 0);
  const monthlyRevenue = Number(metrics?.revenueMonth || 0);
  const progress = monthlyGoal > 0
    ? Math.min(100, (monthlyRevenue / monthlyGoal) * 100)
    : 0;

  return (
    <section className="settings-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Centro de comando</span>
          <h2>Configurações</h2>
          <p>Altere dados comerciais e conteúdos sem editar o código.</p>
        </div>
        <button className="primary" onClick={saveSettings} disabled={saving}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>

      <div className="settings-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="settings-grid">
          <SettingsCard title="Identidade da empresa" description="Informações principais da marca.">
            <SettingField label="Nome da empresa">
              <input value={settings.companyName || ""} onChange={(e) => updateSetting("companyName", e.target.value)} />
            </SettingField>
            <SettingField label="Slogan">
              <input value={settings.slogan || ""} onChange={(e) => updateSetting("slogan", e.target.value)} />
            </SettingField>
            <SettingField label="URL da logo">
              <input value={settings.logoUrl || ""} onChange={(e) => updateSetting("logoUrl", e.target.value)} />
            </SettingField>
            <SettingField label="URL do favicon">
              <input value={settings.faviconUrl || ""} onChange={(e) => updateSetting("faviconUrl", e.target.value)} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Contato e redes" description="Canais oficiais exibidos aos clientes.">
            <SettingField label="E-mail de suporte">
              <input type="email" value={settings.supportEmail || ""} onChange={(e) => updateSetting("supportEmail", e.target.value)} />
            </SettingField>
            <SettingField label="WhatsApp">
              <input value={settings.supportWhatsapp || ""} onChange={(e) => updateSetting("supportWhatsapp", e.target.value)} placeholder="5551999999999" />
            </SettingField>
            <SettingField label="Instagram">
              <input value={settings.instagramUrl || ""} onChange={(e) => updateSetting("instagramUrl", e.target.value)} />
            </SettingField>
            <SettingField label="Facebook">
              <input value={settings.facebookUrl || ""} onChange={(e) => updateSetting("facebookUrl", e.target.value)} />
            </SettingField>
            <SettingField label="Site oficial">
              <input value={settings.websiteUrl || ""} onChange={(e) => updateSetting("websiteUrl", e.target.value)} />
            </SettingField>
          </SettingsCard>
        </div>
      )}

      {activeTab === "landing" && (
        <div className="settings-grid">
          <SettingsCard title="Hero da landing" description="Primeira mensagem vista pelo visitante.">
            <SettingField label="Selo superior">
              <input value={settings.landingBadge || ""} onChange={(e) => updateSetting("landingBadge", e.target.value)} />
            </SettingField>
            <SettingField label="Título principal">
              <input value={settings.landingTitleBefore || ""} onChange={(e) => updateSetting("landingTitleBefore", e.target.value)} />
            </SettingField>
            <SettingField label="Trecho em destaque">
              <input value={settings.landingTitleHighlight || ""} onChange={(e) => updateSetting("landingTitleHighlight", e.target.value)} />
            </SettingField>
            <SettingField label="Subtítulo">
              <textarea value={settings.landingSubtitle || ""} onChange={(e) => updateSetting("landingSubtitle", e.target.value)} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Aviso promocional" description="Faixa opcional no topo da landing.">
            <SettingToggle
              label="Mostrar aviso promocional"
              checked={Boolean(settings.promoBannerEnabled)}
              onChange={(value) => updateSetting("promoBannerEnabled", value)}
            />
            <SettingField label="Texto do aviso">
              <input value={settings.promoBannerText || ""} onChange={(e) => updateSetting("promoBannerText", e.target.value)} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Seções da landing" description="Escolha o que aparece na página inicial.">
            <SettingToggle label="Mostrar exemplos" checked={Boolean(settings.landingShowExamples)} onChange={(value) => updateSetting("landingShowExamples", value)} />
            <SettingToggle label="Mostrar planos" checked={Boolean(settings.landingShowPlans)} onChange={(value) => updateSetting("landingShowPlans", value)} />
            <SettingToggle label="Mostrar selos de confiança" checked={Boolean(settings.landingShowProof)} onChange={(value) => updateSetting("landingShowProof", value)} />
          </SettingsCard>
        </div>
      )}

      {activeTab === "commercial" && (
        <div className="settings-grid">
          <SettingsCard title="Metas comerciais" description="Objetivos usados no painel administrativo.">
            <SettingField label="Meta mensal de receita">
              <input type="number" min="0" step="100" value={settings.monthlyRevenueGoal ?? 0} onChange={(e) => updateSetting("monthlyRevenueGoal", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Meta anual de receita">
              <input type="number" min="0" step="1000" value={settings.annualRevenueGoal ?? 0} onChange={(e) => updateSetting("annualRevenueGoal", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Meta mensal de vendas">
              <input type="number" min="0" step="1" value={settings.monthlySalesGoal ?? 0} onChange={(e) => updateSetting("monthlySalesGoal", Number(e.target.value))} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Progresso atual" description="Comparação com o faturamento do mês.">
            <div className="goal-preview">
              <div><span>Receita do mês</span><strong>{money(monthlyRevenue)}</strong></div>
              <div><span>Meta mensal</span><strong>{money(monthlyGoal)}</strong></div>
              <div className="goal-track"><i style={{ width: `${progress}%` }} /></div>
              <b>{progress.toFixed(1)}% concluído</b>
            </div>
          </SettingsCard>
        </div>

      )}

      {activeTab === "payments" && (
        <div className="settings-grid">
          <SettingsCard title="PIX e checkout" description="Controle a disponibilidade e as mensagens do pagamento.">
            <SettingToggle label="PIX ativo" checked={Boolean(settings.pixEnabled)} onChange={(value) => updateSetting("pixEnabled", value)} />
            <SettingField label="Tempo de expiração visual, em minutos">
              <input type="number" min="5" max="1440" value={settings.pixExpirationMinutes ?? 60} onChange={(e) => updateSetting("pixExpirationMinutes", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Mensagem antes do pagamento">
              <textarea value={settings.checkoutMessage || ""} onChange={(e) => updateSetting("checkoutMessage", e.target.value)} />
            </SettingField>
            <SettingField label="Mensagem após aprovação">
              <textarea value={settings.paymentApprovedMessage || ""} onChange={(e) => updateSetting("paymentApprovedMessage", e.target.value)} />
            </SettingField>
            <SettingField label="Destino após o pagamento">
              <select value={settings.afterPaymentDestination || "dashboard"} onChange={(e) => updateSetting("afterPaymentDestination", e.target.value)}>
                <option value="dashboard">Dashboard do cliente</option>
                <option value="tribute">Homenagem publicada</option>
              </select>
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Status da integração" description="Segredos permanecem protegidos nas variáveis do servidor.">
            <div className="integration-status">
              <span className="status success">Asaas configurado no servidor</span>
              <p>A chave da API não é exibida nem salva no navegador.</p>
              <p>O tempo configurado aqui controla a experiência visual. A validade definitiva da cobrança depende do provedor.</p>
            </div>
          </SettingsCard>
        </div>
      )}

      {activeTab === "music" && (
        <div className="settings-grid">
          <SettingsCard title="Experiência musical" description="Defina como as trilhas se comportam nas homenagens.">
            <SettingToggle label="Música habilitada" checked={Boolean(settings.musicEnabled)} onChange={(value) => updateSetting("musicEnabled", value)} />
            <SettingToggle label="Tentar reprodução automática" checked={Boolean(settings.musicAutoplay)} onChange={(value) => updateSetting("musicAutoplay", value)} />
            <SettingToggle label="Mostrar controles de música" checked={Boolean(settings.musicShowPlayer)} onChange={(value) => updateSetting("musicShowPlayer", value)} />
            <SettingToggle label="Permitir busca no YouTube" checked={Boolean(settings.youtubeSearchEnabled)} onChange={(value) => updateSetting("youtubeSearchEnabled", value)} />
            <SettingField label={`Volume inicial: ${settings.musicDefaultVolume ?? 68}%`}>
              <input type="range" min="0" max="100" value={settings.musicDefaultVolume ?? 68} onChange={(e) => updateSetting("musicDefaultVolume", Number(e.target.value))} />
            </SettingField>
          </SettingsCard>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="settings-grid">
          <SettingsCard title="Imagens das homenagens" description="Configure compressão e validação antes de salvar.">
            <SettingToggle label="Upload de fotos habilitado" checked={Boolean(settings.uploadEnabled)} onChange={(value) => updateSetting("uploadEnabled", value)} />
            <SettingField label="Tamanho máximo por arquivo, em MB">
              <input type="number" min="1" max="30" value={settings.uploadMaxSizeMb ?? 8} onChange={(e) => updateSetting("uploadMaxSizeMb", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Maior dimensão da imagem, em pixels">
              <input type="number" min="600" max="4000" step="100" value={settings.uploadMaxDimension ?? 1600} onChange={(e) => updateSetting("uploadMaxDimension", Number(e.target.value))} />
            </SettingField>
            <SettingField label={`Qualidade JPEG: ${settings.uploadQualityPercent ?? 82}%`}>
              <input type="range" min="40" max="100" value={settings.uploadQualityPercent ?? 82} onChange={(e) => updateSetting("uploadQualityPercent", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Formatos aceitos">
              <input value={settings.uploadAcceptedFormats || ""} onChange={(e) => updateSetting("uploadAcceptedFormats", e.target.value)} />
            </SettingField>
          </SettingsCard>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="settings-grid">
          <SettingsCard title="Sugestão de texto" description="Configurações do gerador atual e base para a futura IA guiada.">
            <SettingToggle label="Sugestão de texto habilitada" checked={Boolean(settings.aiEnabled)} onChange={(value) => updateSetting("aiEnabled", value)} />
            <SettingField label="Estilo padrão">
              <select value={settings.aiDefaultStyle || "emocionante"} onChange={(e) => updateSetting("aiDefaultStyle", e.target.value)}>
                <option value="emocionante">Emocionante</option>
                <option value="romantico">Romântico</option>
                <option value="gratidao">Gratidão</option>
                <option value="amizade">Amizade</option>
                <option value="curto">Curto</option>
              </select>
            </SettingField>
            <SettingField label="Máximo de caracteres">
              <input type="number" min="300" max="10000" value={settings.aiMaxCharacters ?? 3000} onChange={(e) => updateSetting("aiMaxCharacters", Number(e.target.value))} />
            </SettingField>
            <SettingField label="Prompt base futuro">
              <textarea value={settings.aiPromptBase || ""} onChange={(e) => updateSetting("aiPromptBase", e.target.value)} />
            </SettingField>
          </SettingsCard>
        </div>
      )}

      {activeTab === "whatsapp" && (
        <div className="settings-grid">
          <SettingsCard title="Compartilhamento por WhatsApp" description="Use {NOME}, {LINK} e {PLANO} nas mensagens.">
            <SettingToggle label="WhatsApp habilitado" checked={Boolean(settings.whatsappEnabled)} onChange={(value) => updateSetting("whatsappEnabled", value)} />
            <SettingField label="Mensagem padrão">
              <textarea value={settings.whatsappTemplate || ""} onChange={(e) => updateSetting("whatsappTemplate", e.target.value)} />
            </SettingField>
          </SettingsCard>
        </div>
      )}

      {activeTab === "emails" && (
        <div className="settings-grid">
          <SettingsCard title="Cadastro" description="Modelo usado na recepção do cliente.">
            <SettingField label="Assunto">
              <input value={settings.emailRegistrationSubject || ""} onChange={(e) => updateSetting("emailRegistrationSubject", e.target.value)} />
            </SettingField>
            <SettingField label="Mensagem">
              <textarea value={settings.emailRegistrationBody || ""} onChange={(e) => updateSetting("emailRegistrationBody", e.target.value)} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="PIX gerado" description="Use {LINK}, {NOME} e {PLANO}.">
            <SettingField label="Assunto">
              <input value={settings.emailPixSubject || ""} onChange={(e) => updateSetting("emailPixSubject", e.target.value)} />
            </SettingField>
            <SettingField label="Mensagem">
              <textarea value={settings.emailPixBody || ""} onChange={(e) => updateSetting("emailPixBody", e.target.value)} />
            </SettingField>
          </SettingsCard>

          <SettingsCard title="Pagamento aprovado" description="Mensagem enviada após a confirmação.">
            <SettingField label="Assunto">
              <input value={settings.emailApprovedSubject || ""} onChange={(e) => updateSetting("emailApprovedSubject", e.target.value)} />
            </SettingField>
            <SettingField label="Mensagem">
              <textarea value={settings.emailApprovedBody || ""} onChange={(e) => updateSetting("emailApprovedBody", e.target.value)} />
            </SettingField>
          </SettingsCard>
        </div>
      )}
    </section>
  );
}

function SettingsCard({ title, description, children }) {
  return (
    <article className="settings-card">
      <div className="settings-card-head">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="settings-fields">{children}</div>
    </article>
  );
}

function SettingField({ label, children }) {
  return <label className="setting-field"><span>{label}</span>{children}</label>;
}

function SettingToggle({ label, checked, onChange }) {
  return (
    <label className="setting-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i></i>
    </label>
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
.business-grid{display:grid;grid-template-columns:1.55fr .85fr;gap:18px}.panel{padding:22px}.panel-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}.panel-heading h3{font:700 23px Georgia,serif;margin:5px 0 0}.panel-heading strong{font-size:22px;color:#efbd52}.link-button{border:0;background:transparent;color:#efbd52;font-weight:900;cursor:pointer}
.revenue-chart{height:230px;display:flex;align-items:end;gap:5px;padding-top:20px}.revenue-chart div{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:7px}.revenue-chart span{width:100%;min-height:5px;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,#f7dc82,#a97124)}.revenue-chart small{font-size:8px;color:#777168}
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
.coupon-admin-head{display:flex;justify-content:space-between;gap:12px}.coupon-admin-head span{font-size:10px;text-transform:uppercase;color:#8dffb2}.coupon-admin-head h3{font:700 29px Georgia,serif;margin:5px 0}.coupon-admin-head strong{color:#efbd52;font-size:25px}.coupon-admin-card p{color:#aaa194}
.coupon-admin-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}.coupon-admin-meta span{background:rgba(255,255,255,.035);border-radius:11px;padding:10px;color:#8f887e;font-size:11px}.coupon-admin-meta b{display:block;color:#fff3d5;margin-top:4px}
.coupon-admin-actions,.coupon-editor-actions{display:flex;gap:8px;justify-content:flex-end}.coupon-admin-actions button,.coupon-editor-actions button{border:1px solid rgba(239,189,82,.16);background:rgba(255,255,255,.04);color:#fff;border-radius:11px;padding:10px 13px;font-weight:900;cursor:pointer}.danger-button{color:#ffb1b1!important;border-color:rgba(255,80,80,.2)!important}
.coupon-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.coupon-editor label{display:grid;gap:6px;color:#cdbf9d;font-size:12px;font-weight:900;margin:10px 0}.coupon-editor input,.coupon-editor select,.coupon-editor textarea{width:100%;border:1px solid rgba(239,189,82,.15);background:#101513;color:#fff;border-radius:11px;padding:11px}.coupon-editor textarea{min-height:82px}.coupon-switches{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0 18px}

.settings-stack{display:grid;gap:18px}.settings-tabs{display:flex;gap:8px;flex-wrap:wrap}.settings-tabs button{border:1px solid rgba(239,189,82,.15);background:rgba(255,255,255,.04);color:#cfc8bc;border-radius:12px;padding:11px 17px;font-weight:900;cursor:pointer}.settings-tabs button.active{background:linear-gradient(135deg,#c99337,#f7dc82);color:#171005;border-color:transparent}
.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.settings-card{border:1px solid rgba(239,189,82,.13);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));border-radius:22px;padding:21px;box-shadow:0 24px 70px rgba(0,0,0,.22)}.settings-card-head h3{font:700 25px Georgia,serif;margin:0 0 6px}.settings-card-head p{margin:0;color:#918a80}.settings-fields{display:grid;gap:12px;margin-top:18px}.setting-field{display:grid;gap:7px}.setting-field span{color:#d9c79e;font-size:12px;font-weight:900}.setting-field input,.setting-field textarea,.setting-field select{width:100%;border:1px solid rgba(239,189,82,.15);background:#101513;color:#fff;border-radius:12px;padding:12px;font:inherit}.setting-field textarea{min-height:110px;resize:vertical}.setting-field select{appearance:auto}.setting-field input[type="range"]{padding:0;background:transparent}.setting-field input:focus,.setting-field textarea:focus,.setting-field select:focus{outline:none;border-color:#efbd52;box-shadow:0 0 0 3px rgba(239,189,82,.1)}
.setting-toggle{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:12px}.setting-toggle span{font-weight:900;color:#ddd3c0}.setting-toggle input{display:none}.setting-toggle i{width:42px;height:24px;border-radius:999px;background:#2d322f;position:relative}.setting-toggle i:after{content:"";position:absolute;width:18px;height:18px;border-radius:50%;background:#999;top:3px;left:3px;transition:.2s}.setting-toggle input:checked+i{background:#8d6c29}.setting-toggle input:checked+i:after{left:21px;background:#ffe094}
.goal-preview{display:grid;gap:12px}.goal-preview div:not(.goal-track){display:flex;justify-content:space-between;gap:12px;color:#aaa194}.goal-preview strong{color:#fff3d5}.goal-track{height:13px;border-radius:999px;background:#1e2522;overflow:hidden}.goal-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#c99337,#f7dc82)}.goal-preview b{color:#efbd52}.pets-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px}.pet-clinic-card{padding:22px;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035)}.pet-clinic-head{display:flex;justify-content:space-between;gap:15px}.pet-clinic-head h3{margin:5px 0}.pet-clinic-head small,.pet-clinic-head span{color:#9da7b5}.pet-clinic-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}.pet-clinic-meta span,.clinic-detail-grid span{color:#8f99a8;font-size:12px}.pet-clinic-meta b,.clinic-detail-grid b{display:block;color:#fff;margin-top:4px}.pet-clinic-actions{display:flex;gap:8px;flex-wrap:wrap}.pet-clinic-actions button{min-height:40px;padding:0 13px;border-radius:10px}.rejection{color:#ffb1ba}.pet-modal{width:min(820px,94vw);max-height:92vh;overflow:auto;background:#0c1118;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:24px}.clinic-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;border-radius:14px;background:rgba(255,255,255,.035);margin-bottom:18px}.integration-status{display:grid;gap:12px}.integration-status p{margin:0;color:#aaa194;line-height:1.55}
.finance-table{padding:8px 20px}.finance-row{display:grid;grid-template-columns:1.25fr .7fr .75fr .7fr .65fr 1fr 1.2fr;gap:12px;align-items:center;padding:14px 4px;border-top:1px solid rgba(255,255,255,.065);min-width:1050px}.finance-row.header{border-top:0;color:#847e75;text-transform:uppercase;font-size:10px;font-weight:1000}.finance-row b,.finance-row small{display:block}.finance-row small{color:#8f887e;margin-top:4px}.finance-actions{display:flex;gap:6px;flex-wrap:wrap}.finance-actions button,.finance-actions a{border:1px solid rgba(239,189,82,.16);background:rgba(255,255,255,.04);color:#fff;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}.finance-actions .confirm{color:#8dffb2;border-color:rgba(69,194,113,.25)}.finance-modal{width:min(760px,94vw);max-height:92vh;overflow:auto;background:#0c1110;border:1px solid rgba(239,189,82,.2);border-radius:22px;padding:24px}.finance-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.finance-form-grid label{display:grid;gap:7px;color:#d8c9a9;font-size:12px;font-weight:900}.finance-form-grid label.wide{grid-column:1/-1}.finance-form-grid input,.finance-form-grid select,.finance-form-grid textarea{width:100%;border:1px solid rgba(239,189,82,.15);background:#101513;color:#fff;border-radius:11px;padding:12px;font:inherit}.finance-form-grid textarea{min-height:90px;resize:vertical}
@media(max-width:1180px){.admin-page{grid-template-columns:220px 1fr}.metric-grid,.plans-grid{grid-template-columns:1fr 1fr}.business-grid{grid-template-columns:1fr}}
@media(max-width:980px){.coupon-admin-grid{grid-template-columns:1fr 1fr}.coupon-form-grid{grid-template-columns:1fr 1fr}}
@media(max-width:760px){.finance-form-grid{grid-template-columns:1fr}.finance-form-grid label.wide{grid-column:auto}.settings-grid,.coupon-admin-grid,.coupon-form-grid{grid-template-columns:1fr}.admin-page{display:block}.sidebar{height:auto;position:static}.sidebar nav{grid-template-columns:1fr 1fr}.sidebar-footer{display:none}.workspace{padding:20px 14px}.topbar,.welcome,.section-heading{align-items:flex-start;flex-direction:column}.metric-grid,.plans-grid{grid-template-columns:1fr}.first-sale{min-width:0;width:100%}.field-grid{grid-template-columns:1fr}}
`}</style>
  );
}
