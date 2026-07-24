"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMIN_LEVEL_DEFAULTS, ADMIN_PERMISSION_DEFINITIONS } from "../../lib/adminPermissions";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", adminLevel: "ADMIN", modules: { ...ADMIN_LEVEL_DEFAULTS.ADMIN } };
const LEVEL_LABELS = { SUPER_ADMIN: "Super Admin", ADMIN: "Administrador", ATTENDANT: "Atendente" };

function modulesFor(level, current) {
  const normalized = String(level || "ADMIN").toUpperCase();
  if (normalized === "SUPER_ADMIN") return { ...ADMIN_LEVEL_DEFAULTS.SUPER_ADMIN };
  return { ...(ADMIN_LEVEL_DEFAULTS[normalized] || ADMIN_LEVEL_DEFAULTS.ADMIN), ...(current || {}) };
}

export default function AdminUsers({ currentAdmin }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [modal, setModal] = useState(null);
  const isSuperAdmin = String(currentAdmin?.permissions?.adminLevel || "SUPER_ADMIN").toUpperCase() === "SUPER_ADMIN";

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/staff", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível carregar a equipe.");
      setUsers(result.users || []);
      setCurrentUserId(result.currentUserId || "");
    } catch (error) {
      setModal({ title: "Acesso à equipe", text: error.message });
    } finally { setLoading(false); }
  }

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const orderedUsers = useMemo(() => [...users].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  }), [users]);

  async function request(method, payload, successTitle) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/staff", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível salvar.");
      setEditor(null);
      await load();
      setModal({ title: successTitle, text: result.message || "Alterações salvas." });
    } catch (error) { setModal({ title: "Não foi possível salvar", text: error.message }); }
    finally { setBusy(false); }
  }

  function setLevel(level) {
    setEditor((current) => ({ ...current, adminLevel: level, modules: modulesFor(level, level === current.adminLevel ? current.modules : null) }));
  }

  function toggleModule(key) {
    if (editor.adminLevel === "SUPER_ADMIN") return;
    setEditor((current) => ({ ...current, modules: { ...current.modules, [key]: !current.modules?.[key] } }));
  }

  if (!isSuperAdmin) return <section className="staff-denied"><h2>Usuários do painel</h2><p>Esta área é exclusiva para Super Admin.</p></section>;

  return <section className="staff-admin">
    <style>{css}</style>
    <header className="staff-head"><div><span>Equipe Eterniza</span><h2>Usuários e permissões</h2><p>Controle exatamente quais módulos cada pessoa pode acessar.</p></div><button onClick={() => setEditor({ mode: "create", ...EMPTY_FORM })}>+ Novo usuário</button></header>

    <div className="staff-levels">
      <article><b>Super Admin</b><p>Acesso total e permanente a todos os módulos.</p></article>
      <article><b>Administrador</b><p>Perfil operacional com permissões personalizáveis.</p></article>
      <article><b>Atendente</b><p>Começa somente com a Central de Atendimento.</p></article>
    </div>

    <div className="staff-table-wrap">{loading ? <div className="staff-empty">Carregando equipe...</div> : <table className="staff-table">
      <thead><tr><th>Usuário</th><th>Perfil</th><th>Acessos</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead>
      <tbody>{orderedUsers.map((user) => <tr key={user.id}>
        <td><strong>{user.name}</strong><small>{user.email}</small></td>
        <td><span className="level-badge">{LEVEL_LABELS[user.adminLevel] || user.adminLevel}</span></td>
        <td><button className="permission-count" onClick={() => setEditor({ mode: "permissions", ...user, modules: modulesFor(user.adminLevel, user.modules) })}>{Object.values(user.modules || {}).filter(Boolean).length} módulos</button></td>
        <td><span className={user.isActive ? "staff-active" : "staff-blocked"}>{user.isActive ? "Ativo" : "Bloqueado"}</span></td>
        <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Nunca acessou"}</td>
        <td><div className="staff-actions"><button onClick={() => setEditor({ mode: "password", id: user.id, name: user.name, password: "" })}>Nova senha</button><button disabled={busy || user.id === currentUserId} className={user.isActive ? "block" : "enable"} onClick={() => request("PATCH", { id: user.id, isActive: !user.isActive }, "Usuário atualizado")}>{user.isActive ? "Bloquear" : "Ativar"}</button></div></td>
      </tr>)}</tbody>
    </table>}</div>

    {(editor?.mode === "create" || editor?.mode === "permissions") && <div className="staff-modal"><form onSubmit={(event) => { event.preventDefault(); request(editor.mode === "create" ? "POST" : "PATCH", editor.mode === "create" ? editor : { id: editor.id, adminLevel: editor.adminLevel, modules: editor.modules }, editor.mode === "create" ? "Usuário criado" : "Permissões atualizadas"); }}>
      <header><div><small>{editor.mode === "create" ? "Novo acesso" : "Controle de acesso"}</small><h3>{editor.mode === "create" ? "Criar usuário do painel" : editor.name}</h3></div><button type="button" onClick={() => setEditor(null)}>×</button></header>
      {editor.mode === "create" && <div className="form-grid"><label>Nome<input required value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })}/></label><label>E-mail<input required type="email" value={editor.email} onChange={(e) => setEditor({ ...editor, email: e.target.value })}/></label><label>Telefone<input value={editor.phone} onChange={(e) => setEditor({ ...editor, phone: e.target.value })}/></label><label>Senha inicial<input required minLength={8} type="password" value={editor.password} onChange={(e) => setEditor({ ...editor, password: e.target.value })}/></label></div>}
      <label>Perfil<select value={editor.adminLevel} disabled={editor.id === currentUserId} onChange={(e) => setLevel(e.target.value)}>{Object.entries(LEVEL_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="permissions-head"><div><b>Permissões por módulo</b><small>{editor.adminLevel === "SUPER_ADMIN" ? "Super Admin sempre possui acesso total." : "Marque somente o que esta pessoa precisa usar."}</small></div>{editor.adminLevel !== "SUPER_ADMIN" && <button type="button" onClick={() => setEditor({ ...editor, modules: modulesFor(editor.adminLevel) })}>Restaurar padrão</button>}</div>
      <div className="permission-grid">{ADMIN_PERMISSION_DEFINITIONS.map((item) => <label key={item.key} className={editor.modules?.[item.key] ? "permission-card checked" : "permission-card"}><input type="checkbox" disabled={editor.adminLevel === "SUPER_ADMIN" || (item.key === "staff" && editor.id === currentUserId)} checked={Boolean(editor.modules?.[item.key])} onChange={() => toggleModule(item.key)}/><span><b>{item.label}</b><small>{item.description}</small></span></label>)}</div>
      <footer><button type="button" onClick={() => setEditor(null)}>Cancelar</button><button disabled={busy}>{busy ? "Salvando..." : "Salvar acesso"}</button></footer>
    </form></div>}

    {editor?.mode === "password" && <div className="staff-modal"><form onSubmit={(e) => { e.preventDefault(); request("PATCH", { id: editor.id, password: editor.password }, "Senha atualizada"); }}><header><div><small>Segurança</small><h3>Nova senha para {editor.name}</h3></div><button type="button" onClick={() => setEditor(null)}>×</button></header><label>Nova senha<input autoFocus required minLength={8} type="password" value={editor.password} onChange={(e) => setEditor({ ...editor, password: e.target.value })}/><small>Mínimo de 8 caracteres.</small></label><footer><button type="button" onClick={() => setEditor(null)}>Cancelar</button><button disabled={busy}>{busy ? "Salvando..." : "Atualizar senha"}</button></footer></form></div>}
    {modal && <div className="staff-modal notice"><div><h3>{modal.title}</h3><p>{modal.text}</p><button onClick={() => setModal(null)}>Entendi</button></div></div>}
  </section>;
}

const css = `.staff-admin{display:grid;gap:20px}.staff-head{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px;border:1px solid #ffffff12;border-radius:24px;background:linear-gradient(135deg,#0e1d29,#08111a)}.staff-head span{color:#e0b76a;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.staff-head h2{font-size:32px;margin:7px 0}.staff-head p{margin:0;color:#91a6b3}.staff-head>button{min-height:46px;padding:0 18px;border:0;border-radius:13px;background:#d8ae62;color:#071018;font-weight:900}.staff-levels{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.staff-levels article{padding:18px;border:1px solid #ffffff10;border-radius:17px;background:#ffffff06}.staff-levels b{color:#e8c57e}.staff-levels p{margin:7px 0 0;color:#8fa3af;font-size:13px}.staff-table-wrap{overflow:auto;border:1px solid #ffffff12;border-radius:20px;background:#071019}.staff-table{width:100%;border-collapse:collapse;min-width:980px}.staff-table th,.staff-table td{padding:15px;text-align:left;border-bottom:1px solid #ffffff0d}.staff-table th{color:#8196a3;font-size:11px;text-transform:uppercase}.staff-table td strong,.staff-table td small{display:block}.staff-table td small{margin-top:4px;color:#8196a3}.level-badge,.permission-count{padding:7px 10px;border:1px solid #ffffff12;border-radius:20px;background:#ffffff07;color:#d7e1e7;font-size:11px}.permission-count{cursor:pointer;color:#e8c57e}.staff-active,.staff-blocked{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:11px;font-weight:900}.staff-active{background:#49bb7b22;color:#78dca0}.staff-blocked{background:#c8576122;color:#ef8d95}.staff-actions{display:flex;gap:7px}.staff-actions button{padding:8px 10px;border:1px solid #ffffff15;border-radius:9px;background:#ffffff08;color:#fff}.staff-actions .block{color:#ef8d95}.staff-actions .enable{color:#78dca0}.staff-empty{padding:45px;text-align:center;color:#8296a2}.staff-modal{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:20px;background:#000b}.staff-modal form,.staff-modal.notice>div{width:min(800px,100%);max-height:92vh;overflow:auto;display:grid;gap:15px;padding:25px;border:1px solid #ffffff18;border-radius:24px;background:#0b1721}.staff-modal header{display:flex;justify-content:space-between;align-items:flex-start}.staff-modal header small{color:#d8ae62}.staff-modal h3{margin:5px 0;font-size:24px}.staff-modal header>button{border:0;background:transparent;color:#fff;font-size:28px}.staff-modal label{display:grid;gap:7px;color:#b5c3cb;font-size:12px}.staff-modal input,.staff-modal select{min-height:45px;padding:0 12px;border:1px solid #ffffff18;border-radius:11px;background:#ffffff08;color:#fff}.staff-modal select option{color:#111}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.permissions-head{display:flex;justify-content:space-between;gap:15px;align-items:end;padding-top:5px}.permissions-head small{display:block;margin-top:4px;color:#8296a2}.permissions-head button{border:1px solid #ffffff15;border-radius:10px;background:#ffffff08;color:#fff;padding:8px 11px}.permission-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.permission-card{grid-template-columns:20px 1fr!important;align-items:start;padding:13px;border:1px solid #ffffff10;border-radius:13px;background:#ffffff04;cursor:pointer}.permission-card.checked{border-color:#d8ae6255;background:#d8ae6210}.permission-card input{min-height:auto;margin-top:3px;accent-color:#d8ae62}.permission-card span b,.permission-card span small{display:block}.permission-card span small{margin-top:4px;color:#8296a2}.staff-modal footer{display:flex;justify-content:flex-end;gap:9px}.staff-modal footer button,.staff-modal.notice button{min-height:43px;padding:0 15px;border:1px solid #ffffff16;border-radius:11px;background:#ffffff08;color:#fff}.staff-modal footer button:last-child,.staff-modal.notice button{border:0;background:#d8ae62;color:#071018;font-weight:900}.staff-modal.notice>div{width:min(520px,100%);text-align:center}.staff-modal.notice p{color:#9eb0bb}.staff-denied{padding:40px;border:1px solid #ffffff12;border-radius:22px;background:#ffffff06}@media(max-width:800px){.staff-head{align-items:flex-start;flex-direction:column}.staff-levels,.permission-grid,.form-grid{grid-template-columns:1fr}}`;
