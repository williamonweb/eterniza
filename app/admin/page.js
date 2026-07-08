"use client";

import { useEffect, useState } from "react";

const sections = [
  ["dashboard", "📈", "Dashboard"],
  ["clientes", "👥", "Clientes"],
  ["homenagens", "🎁", "Homenagens"],
  ["biblioteca", "🎵", "Biblioteca"],
  ["escritor", "🤖", "Escritor Eterniza"],
  ["cupons", "🎟️", "Cupons"],
  ["pagamentos", "💳", "Pagamentos"],
  ["analytics", "📊", "Analytics"],
  ["qrcode", "▦", "QR Code"],
  ["whatsapp", "📱", "WhatsApp"],
  ["configuracoes", "⚙️", "Configurações"],
];

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me", { method: "GET" });
        const me = await meRes.json();

        if (!meRes.ok || !me?.ok || me.user?.role !== "admin") {
          setAuthorized(false);
          setMounted(true);
          return;
        }

        setAuthorized(true);

        const res = await fetch("/api/tributes/list", { method: "GET" });
        const data = await res.json();

        if (data?.ok && Array.isArray(data.tributes)) {
          const mapped = data.tributes.map((t) => ({
            id: t.id,
            receiverName: t.receiver_name || t.title || "Homenagem",
            senderName: t.sender_name || "",
            userEmail: t.user_email || "",
            status: t.status || "rascunho",
            slug: t.slug,
            publicUrl: t.public_url,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            recipient: {
              id: t.category,
              title: t.category || "Presente",
            },
            plan: {
              id: t.plan_id,
              name: t.plan_name || "Plano",
              cents: t.plan_price_cents || 0,
            },
            photos: (t.content && t.content.photos) || [],
          }));

          setOrders(mapped);
        }

        const usersRes = await fetch("/api/admin/users", { method: "GET" });
        const usersData = await usersRes.json();

        if (usersData?.ok && Array.isArray(usersData.users)) {
          setClientes(
            usersData.users.map((u) => ({
              id: u.id,
              nome: u.name || "Cliente",
              email: u.email || "",
              whatsapp: u.phone || "—",
              plano: "Cliente",
              status: String(u.totalTributes || 0) + " homenagem(ns)",
              createdAt: u.createdAt,
            }))
          );
        }
      } catch (e) {
        console.error(e);
        setAuthorized(false);
      } finally {
        setMounted(true);
      }
    }

    load();
  }, []);

  const receita = orders.reduce((sum, o) => sum + (o.plan?.cents || 0), 0) / 100;
  const publicados = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("public")
  ).length;

  const filteredOrders = orders.filter((o) =>
    JSON.stringify(o).toLowerCase().includes(query.toLowerCase())
  );

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    window.location.replace("/login");
  }

  if (!mounted) {
    return <main className="admin-page" />;
  }

  if (!authorized) {
    return (
      <main className="admin-page">
        <Style />
        <section className="locked">
          <img src="/eterniza/assets/brand/logo-eterniza.png" />
          <h1>Acesso administrativo</h1>
          <p>Entre com o usuário da Jeslie para acessar o painel Eterniza.</p>
          <a href="/login">Ir para login</a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <Style />

      <header className="admin-top">
        <div>
          <strong>Jeslie</strong>
          <span>Administradora Eterniza • Online</span>
        </div>
        <button onClick={logout}>🚪 Sair</button>
      </header>

      <section className="admin-layout">
        <aside className="admin-side">
          <h2>Painel Eterniza</h2>
          {sections.map(([id, ico, label]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={active === id ? "active" : ""}
            >
              {ico} {label}
            </button>
          ))}
        </aside>

        <div className="admin-main">
          {active === "dashboard" && (
            <Dashboard
              orders={orders}
              receita={receita}
              publicados={publicados}
              clientes={clientes}
              setActive={setActive}
            />
          )}

          {active === "clientes" && <Clientes clientes={clientes} />}

          {active === "homenagens" && (
            <Homenagens
              orders={filteredOrders}
              query={query}
              setQuery={setQuery}
            />
          )}

          {active === "biblioteca" && <Biblioteca />}
          {active === "escritor" && <Escritor />}
          {active === "cupons" && <Cupons />}
          {active === "pagamentos" && <Pagamentos receita={receita} />}
          {active === "analytics" && <Analytics orders={orders} />}
          {active === "qrcode" && <Qrcode />}
          {active === "whatsapp" && <Whatsapp />}
          {active === "configuracoes" && <Configuracoes />}
        </div>
      </section>
    </main>
  );
}

function Header({ title, desc, children }) {
  return (
    <div className="section-head">
      <div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Dashboard({ orders, receita, publicados, clientes, setActive }) {
  return (
    <>
      <div className="stats">
        <Card n={orders.length} t="homenagens" />
        <Card
          n={receita.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          t="faturamento simulado"
        />
        <Card n={publicados} t="publicadas" />
        <Card n={clientes.length} t="clientes" />
      </div>

      <div className="module-grid">
        {[
          ["👥", "Clientes", "Cadastros reais do sistema", "clientes"],
          ["🎁", "Homenagens", "Links, rascunhos e publicações", "homenagens"],
          ["🎵", "Biblioteca", "Trilhas Eterniza + busca YouTube", "biblioteca"],
          ["🎟️", "Cupons", "Datas especiais e campanhas", "cupons"],
          ["📈", "Analytics", "Visualizações, links e dispositivos", "analytics"],
          ["▦", "QR Code", "Gerar arte para imprimir e vender", "qrcode"],
          ["💳", "Pagamentos", "Mercado Pago e Pix", "pagamentos"],
          ["⚙️", "Configurações", "Logo, planos, preços, domínio e API", "configuracoes"],
        ].map((m) => (
          <button className="module" key={m[2]} onClick={() => setActive(m[3])}>
            <b>
              {m[0]} {m[1]}
            </b>
            <span>{m[2]}</span>
          </button>
        ))}
      </div>

      <Recent orders={orders} />
    </>
  );
}

function Card({ n, t }) {
  return (
    <div className="stat">
      <strong>{n}</strong>
      <span>{t}</span>
    </div>
  );
}

function Recent({ orders }) {
  return (
    <div className="panel">
      <h3>Últimas homenagens</h3>
      {orders.length ? (
        orders
          .slice(-5)
          .reverse()
          .map((o, i) => (
            <div className="row" key={i}>
              <b>{o.receiverName || "Homenagem"}</b>
              <span>
                {o.recipient?.title || "Presente"} • {o.plan?.name || "Plano"}
              </span>
              <a href={`/presente/${o.slug || "demo-maria-e-jose"}`} target="_blank">
                Abrir
              </a>
            </div>
          ))
      ) : (
        <p>Nenhuma homenagem encontrada.</p>
      )}
    </div>
  );
}

function Clientes({ clientes }) {
  return (
    <>
      <Header title="Clientes" desc="Cadastros reais, contatos e quantidade de homenagens." />

      <div className="panel table">
        {clientes.length ? (
          clientes.map((c) => (
            <div className="table-row" key={c.id || c.email}>
              <span>
                <b>{c.nome}</b>
                <small>{c.email}</small>
              </span>
              <span>{c.whatsapp || "—"}</span>
              <span>{c.plano || "Cliente"}</span>
              <span className="pill">{c.status}</span>
              <button
                onClick={() =>
                  alert(
                    `Cliente: ${c.nome}\nE-mail: ${c.email}\nTelefone: ${
                      c.whatsapp || "—"
                    }\n${c.status}`
                  )
                }
              >
                Ver
              </button>
            </div>
          ))
        ) : (
          <p>Nenhum cliente cadastrado ainda.</p>
        )}
      </div>
    </>
  );
}

function Homenagens({ orders, query, setQuery }) {
  return (
    <>
      <Header title="Homenagens" desc="Links publicados, QR Codes e edições.">
        <a className="gold" href="/criar">
          Novo presente
        </a>
      </Header>

      <input
        className="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, plano ou status..."
      />

      <div className="cards">
        {orders.length ? (
          orders.map((o, i) => (
            <div className="gift-card" key={i}>
              <img
                src={
                  (o.photos && o.photos[0]) ||
                  "/eterniza/assets/brand/preview-couple.jpg"
                }
              />
              <b>{o.receiverName || "Homenagem"}</b>
              <span>
                {o.recipient?.title || "Presente"} • {o.plan?.name || "Premium"}
              </span>
              <div>
                <a href={`/presente/${o.slug || "demo-maria-e-jose"}`} target="_blank">
                  Abrir
                </a>
                <button>QR Code</button>
                <button>Editar</button>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma homenagem criada.</p>
        )}
      </div>
    </>
  );
}

function Biblioteca() {
  return (
    <>
      <Header title="Biblioteca" desc="Músicas por emoção e busca YouTube." />
      <div className="cards">
        {["Wedding Story", "Romantic Piano", "Mother’s Day", "Cinematic Emotional", "Heroic"].map(
          (x, i) => (
            <div className="music" key={x}>
              <b>🎵 {x}</b>
              <span>{["Romance", "Romance", "Mãe", "Gratidão", "Pai"][i]}</span>
              <button>▶ Prévia</button>
            </div>
          )
        )}
      </div>
    </>
  );
}

function Escritor() {
  return (
    <>
      <Header title="Escritor Eterniza" desc="Modelos de cartas longas e emocionantes." />
      <div className="panel">
        <div className="chips">
          {[
            "Romântico",
            "Mãe",
            "Pai",
            "Filho(a)",
            "Amizade",
            "Gratidão",
            "Aniversário",
            "Casamento",
            "Luto",
            "Livre",
          ].map((x) => (
            <button key={x}>{x}</button>
          ))}
        </div>
        <textarea placeholder="A carta gerada aparecerá aqui..." />
        <button className="gold">✨ Gerar texto</button>
      </div>
    </>
  );
}

function Cupons() {
  return (
    <>
      <Header title="Cupons" desc="Campanhas para datas comemorativas." />
      <div className="panel table">
        {["NAMORADOS10", "MAE15", "PRIMEIRA20"].map((x) => (
          <div className="table-row" key={x}>
            <b>{x}</b>
            <span>Ativo</span>
            <span>10% a 20%</span>
            <button>Copiar</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Pagamentos({ receita }) {
  return (
    <>
      <Header title="Pagamentos" desc="Pix, Mercado Pago e renovações." />
      <div className="stats">
        <Card
          n={receita.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          t="recebido"
        />
        <Card n="R$ 0,00" t="pendente" />
        <Card n="Pix" t="em preparação" />
        <Card n="Mercado Pago" t="próxima etapa" />
      </div>
    </>
  );
}

function Analytics({ orders }) {
  return (
    <>
      <Header title="Analytics" desc="Visualizações, QR Code e origem dos acessos." />
      <div className="stats">
        <Card n={Math.max(orders.length * 12, 0)} t="visualizações" />
        <Card n="68%" t="celular" />
        <Card n="32%" t="desktop" />
        <Card n={Math.max(orders.length * 3, 0)} t="QR scans" />
      </div>
      <div className="chart">
        <span style={{ height: "35%" }} />
        <span style={{ height: "70%" }} />
        <span style={{ height: "48%" }} />
        <span style={{ height: "90%" }} />
        <span style={{ height: "62%" }} />
      </div>
    </>
  );
}

function Qrcode() {
  return (
    <>
      <Header title="QR Code" desc="Materiais para imprimir e vender." />
      <div className="cards">
        {["PNG WhatsApp", "PDF A4", "Etiqueta", "Cartão presente", "Plaquinha acrílica", "Chaveiro"].map(
          (x) => (
            <div className="gift-card" key={x}>
              <b>▦ {x}</b>
              <span>Modelo pronto para produção.</span>
              <button>Gerar</button>
            </div>
          )
        )}
      </div>
    </>
  );
}

function Whatsapp() {
  return (
    <>
      <Header title="WhatsApp" desc="Mensagens prontas para venda e entrega." />
      <div className="cards">
        {["Link pronto", "Pagamento pendente", "Renovação", "Pós-venda"].map((x) => (
          <div className="gift-card" key={x}>
            <b>📱 {x}</b>
            <p>Olá! Sua homenagem Eterniza está pronta. Acesse pelo link e compartilhe com carinho. ❤️</p>
            <button>Copiar</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Configuracoes() {
  return (
    <>
      <Header title="Configurações" desc="Marca, planos, preços e integrações." />
      <div className="panel">
        <label>Nome da marca</label>
        <input className="search" defaultValue="Eterniza" />
        <label>Slogan</label>
        <input className="search" defaultValue="Onde Cada História Vive Para Sempre!" />
        <button className="gold">Salvar configurações</button>
      </div>
    </>
  );
}

function Style() {
  return (
    <style>{`
.admin-page{min-height:100vh;background:radial-gradient(circle at 10% 0%,rgba(239,189,82,.12),transparent 32%),linear-gradient(135deg,#050706,#071117 62%,#030606);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;padding:28px;box-sizing:border-box}
.admin-top{max-width:1360px;margin:0 auto 18px;border:1px solid rgba(239,189,82,.18);border-radius:22px;background:rgba(255,255,255,.05);padding:18px 22px;display:flex;align-items:center;justify-content:space-between}
.admin-top strong{font-size:20px}
.admin-top span{display:block;color:#f1d89a;font-size:14px}
.admin-top button,.gold{border:0;border-radius:14px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#130d05;font-weight:1000;padding:13px 20px;text-decoration:none;cursor:pointer}
.admin-layout{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:250px 1fr;gap:18px}
.admin-side,.panel,.stat,.module,.gift-card,.music{border:1px solid rgba(239,189,82,.18);background:rgba(255,255,255,.055);border-radius:22px;box-shadow:0 22px 70px rgba(0,0,0,.28)}
.admin-side{padding:18px;align-self:start;position:sticky;top:18px}
.admin-side h2{margin:4px 0 18px;color:#f6cf72;font-size:18px}
.admin-side button{width:100%;text-align:left;margin:6px 0;padding:14px 16px;border-radius:15px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.18);color:#fff;font-weight:900;cursor:pointer}
.admin-side button.active{background:rgba(239,189,82,.16);border-color:rgba(239,189,82,.35)}
.admin-main{display:grid;gap:16px}
.stats{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:14px}
.stat{padding:20px}
.stat strong{font-size:26px;display:block}
.stat span{color:#f1dfb6;font-size:13px}
.module-grid{display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:14px}
.module{text-align:left;padding:20px;cursor:pointer;color:#fff}
.module b{display:block;color:#f6cf72;margin-bottom:8px}
.module span,.gift-card span,.music span,.panel p{color:#f1dfb6}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid rgba(239,189,82,.18);background:rgba(255,255,255,.04);border-radius:22px;padding:22px}
.section-head h1{font-family:Georgia,serif;margin:0;color:#fff8ea}
.section-head p{margin:5px 0 0;color:#f1d89a}
.panel{padding:24px}
.row,.table-row{display:grid;grid-template-columns:1.4fr 1fr 1fr auto auto;gap:12px;align-items:center;border-top:1px solid rgba(255,255,255,.08);padding:14px 0}
.row:first-of-type,.table-row:first-child{border-top:0}
.row a,.gift-card a{color:#f6cf72;font-weight:900}
.table-row small{display:block;color:#bfb19a}
.pill{border:1px solid rgba(239,189,82,.28);border-radius:999px;padding:8px 12px;color:#f6cf72}
.cards{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:15px}
.gift-card,.music{padding:18px;display:grid;gap:10px}
.gift-card img{width:100%;height:140px;object-fit:cover;border-radius:16px}
.gift-card button,.music button,.table-row button,.chips button{border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:10px 13px;font-weight:900;cursor:pointer}
.search,textarea{width:100%;box-sizing:border-box;border:1px solid rgba(239,189,82,.22);background:rgba(255,255,255,.07);color:#fff;border-radius:15px;padding:15px;margin:8px 0 14px;font:inherit}
textarea{min-height:180px}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.chart{height:220px;border:1px solid rgba(239,189,82,.18);border-radius:22px;background:rgba(255,255,255,.04);display:flex;align-items:end;gap:14px;padding:22px}
.chart span{flex:1;background:linear-gradient(180deg,#f7dc82,#c99337);border-radius:12px 12px 0 0}
.locked{min-height:100vh;display:grid;place-items:center;text-align:center}
.locked img{width:160px}
.locked h1{font-family:Georgia,serif;font-size:48px;margin:10px 0}
.locked p{color:#f1d89a}
.locked a{display:inline-block;margin-top:12px;border-radius:15px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#120d05;padding:15px 22px;font-weight:1000;text-decoration:none}
@media(max-width:980px){.admin-layout{grid-template-columns:1fr}.admin-side{position:static}.stats,.module-grid,.cards{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.admin-page{padding:14px}.stats,.module-grid,.cards{grid-template-columns:1fr}.row,.table-row{grid-template-columns:1fr}.admin-top{align-items:flex-start;gap:12px;flex-direction:column}}
`}</style>
  );
}
