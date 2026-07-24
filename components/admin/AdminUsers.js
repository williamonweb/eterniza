"use client";

import { useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  adminLevel: "ADMIN",
};

const LEVEL_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  ATTENDANT: "Atendente",
};

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin]);

  const orderedUsers = useMemo(() => [...users].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  }), [users]);

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editor),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível criar o usuário.");
      setEditor(null);
      await load();
      setModal({ title: "Usuário criado", text: `${result.user.name} já pode acessar o painel.` });
    } catch (error) {
      setModal({ title: "Erro ao criar", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(payload) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível atualizar o usuário.");
      await load();
      setModal({ title: "Usuário atualizado", text: result.message || "As alterações foram salvas." });
    } catch (error) {
      setModal({ title: "Erro ao atualizar", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function openPasswordReset(user) {
    setEditor({ mode: "password", id: user.id, name: user.name, password: "" });
  }

  if (!isSuperAdmin) {
    return <section className="staff-denied"><h2>Usuários do painel</h2><p>Esta área é exclusiva para Super Admin.</p></section>;
  }

  return <section className="staff-admin">
    <style>{css}</style>
    <header className="staff-head">
      <div>
        <span>Equipe Eterniza</span>
        <h2>Usuários do painel</h2>
        <p>Crie acessos, defina permissões e bloqueie usuários sem apagar o histórico.</p>
      </div>
      <button onClick={() => setEditor({ mode: "create", ...EMPTY_FORM })}>+ Novo usuário</button>
    </header>

    <div className="staff-levels">
      <article><b>Super Admin</b><p>Acesso total, inclusive usuários e configurações.</p></article>
      <article><b>Administrador</b><p>Acesso operacional ao painel, sem gerenciar a equipe.</p></article>
      <article><b>Atendente</b><p>Acesso focado somente na Central de Atendimento.</p></article>
    </div>

    <div className="staff-table-wrap">
      {loading ? <div className="staff-empty">Carregando equipe...</div> : <table className="staff-table">
        <thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead>
        <tbody>{orderedUsers.map((user) => <tr key={user.id}>
          <td><strong>{user.name}</strong><small>{user.email}</small></td>
          <td><select disabled={busy || user.id === currentUserId} value={user.adminLevel} onChange={(event) => updateUser({ id: user.id, adminLevel: event.target.value })}>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Administrador</option>
            <option value="ATTENDANT">Atendente</option>
          </select></td>
          <td><span className={user.isActive ? "staff-active" : "staff-blocked"}>{user.isActive ? "Ativo" : "Bloqueado"}</span></td>
          <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Nunca acessou"}</td>
          <td><div className="staff-actions">
            <button onClick={() => openPasswordReset(user)}>Nova senha</button>
            <button disabled={busy || user.id === currentUserId} className={user.isActive ? "block" : "enable"} onClick={() => updateUser({ id: user.id, isActive: !user.isActive })}>{user.isActive ? "Bloquear" : "Ativar"}</button>
          </div></td>
        </tr>)}</tbody>
      </table>}
    </div>

    {editor?.mode === "create" && <div className="staff-modal"><form onSubmit={createUser}>
      <header><div><small>Novo acesso</small><h3>Criar usuário do painel</h3></div><button type="button" onClick={() => setEditor(null)}>×</button></header>
      <label>Nome<input required value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })}/></label>
      <label>E-mail<input required type="email" value={editor.email} onChange={(event) => setEditor({ ...editor, email: event.target.value })}/></label>
      <label>Telefone<input value={editor.phone} onChange={(event) => setEditor({ ...editor, phone: event.target.value })}/></label>
      <label>Perfil<select value={editor.adminLevel} onChange={(event) => setEditor({ ...editor, adminLevel: event.target.value })}>
        {Object.entries(LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Senha inicial<input required minLength={8} type="password" value={editor.password} onChange={(event) => setEditor({ ...editor, password: event.target.value })}/><small>Mínimo de 8 caracteres.</small></label>
      <footer><button type="button" onClick={() => setEditor(null)}>Cancelar</button><button disabled={busy}>{busy ? "Criando..." : "Criar usuário"}</button></footer>
    </form></div>}

    {editor?.mode === "password" && <div className="staff-modal"><form onSubmit={(event) => { event.preventDefault(); updateUser({ id: editor.id, password: editor.password }).then(() => setEditor(null)); }}>
      <header><div><small>Segurança</small><h3>Nova senha para {editor.name}</h3></div><button type="button" onClick={() => setEditor(null)}>×</button></header>
      <label>Nova senha<input autoFocus required minLength={8} type="password" value={editor.password} onChange={(event) => setEditor({ ...editor, password: event.target.value })}/><small>Mínimo de 8 caracteres.</small></label>
      <footer><button type="button" onClick={() => setEditor(null)}>Cancelar</button><button disabled={busy}>{busy ? "Salvando..." : "Atualizar senha"}</button></footer>
    </form></div>}

    {modal && <div className="staff-modal notice"><div><h3>{modal.title}</h3><p>{modal.text}</p><button onClick={() => setModal(null)}>Entendi</button></div></div>}
  </section>;
}

const css = `.staff-admin{display:grid;gap:20px}.staff-head{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px;border:1px solid #ffffff12;border-radius:24px;background:linear-gradient(135deg,#0e1d29,#08111a)}.staff-head span{color:#e0b76a;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.staff-head h2{font-size:32px;margin:7px 0}.staff-head p{margin:0;color:#91a6b3}.staff-head>button{min-height:46px;padding:0 18px;border:0;border-radius:13px;background:#d8ae62;color:#071018;font-weight:900}.staff-levels{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.staff-levels article{padding:18px;border:1px solid #ffffff10;border-radius:17px;background:#ffffff06}.staff-levels b{color:#e8c57e}.staff-levels p{margin:7px 0 0;color:#8fa3af;font-size:13px}.staff-table-wrap{overflow:auto;border:1px solid #ffffff12;border-radius:20px;background:#071019}.staff-table{width:100%;border-collapse:collapse;min-width:850px}.staff-table th,.staff-table td{padding:15px;text-align:left;border-bottom:1px solid #ffffff0d}.staff-table th{color:#8196a3;font-size:11px;text-transform:uppercase}.staff-table td strong,.staff-table td small{display:block}.staff-table td small{margin-top:4px;color:#8196a3}.staff-table select{padding:9px;border:1px solid #ffffff15;border-radius:10px;background:#10212e;color:#fff}.staff-active,.staff-blocked{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:11px;font-weight:900}.staff-active{background:#49bb7b22;color:#78dca0}.staff-blocked{background:#c8576122;color:#ef8d95}.staff-actions{display:flex;gap:7px}.staff-actions button{padding:8px 10px;border:1px solid #ffffff15;border-radius:9px;background:#ffffff08;color:#fff}.staff-actions .block{color:#ef8d95}.staff-actions .enable{color:#78dca0}.staff-empty{padding:45px;text-align:center;color:#8296a2}.staff-modal{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:20px;background:#000b}.staff-modal form,.staff-modal.notice>div{width:min(520px,100%);display:grid;gap:15px;padding:25px;border:1px solid #ffffff18;border-radius:24px;background:#0b1721}.staff-modal header{display:flex;justify-content:space-between;align-items:flex-start}.staff-modal header small{color:#d8ae62}.staff-modal h3{margin:5px 0;font-size:24px}.staff-modal header>button{border:0;background:transparent;color:#fff;font-size:28px}.staff-modal label{display:grid;gap:7px;color:#b5c3cb;font-size:12px}.staff-modal input,.staff-modal select{min-height:45px;padding:0 12px;border:1px solid #ffffff18;border-radius:11px;background:#ffffff08;color:#fff}.staff-modal select option{color:#111}.staff-modal footer{display:flex;justify-content:flex-end;gap:9px}.staff-modal footer button,.staff-modal.notice button{min-height:43px;padding:0 15px;border:1px solid #ffffff16;border-radius:11px;background:#ffffff08;color:#fff}.staff-modal footer button:last-child,.staff-modal.notice button{border:0;background:#d8ae62;color:#071018;font-weight:900}.staff-modal.notice>div{text-align:center}.staff-modal.notice p{color:#9eb0bb}.staff-denied{padding:40px;border:1px solid #ffffff12;border-radius:22px;background:#ffffff06}@media(max-width:800px){.staff-head{align-items:flex-start;flex-direction:column}.staff-levels{grid-template-columns:1fr}}`;
