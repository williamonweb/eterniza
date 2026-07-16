"use client";

import { useState } from "react";

export default function PetsLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pets/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "E-mail ou senha inválidos.");
      }

      window.location.replace("/pets/painel");
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pets-login">
      <style>{`
        *{box-sizing:border-box}.pets-login{min-height:100vh;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 70% 15%,rgba(68,161,239,.22),transparent 30%),linear-gradient(135deg,#020b12,#061a2a 62%,#02070b);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}.login-card{width:min(100%,980px);display:grid;grid-template-columns:1fr 430px;border:1px solid rgba(112,195,255,.2);background:rgba(4,16,26,.88);border-radius:28px;overflow:hidden;box-shadow:0 38px 110px rgba(0,0,0,.52)}.login-visual{padding:42px;display:grid;align-content:center;text-align:center;background:radial-gradient(circle at 50% 34%,rgba(106,194,255,.17),transparent 36%)}.login-visual img{width:min(100%,380px);margin:auto;filter:drop-shadow(0 28px 40px rgba(0,0,0,.45))}.login-visual h1{font:700 42px Georgia,serif;margin:12px 0 7px}.login-visual p{color:#b8d0e0;margin:0}.login-form{padding:46px 38px;background:rgba(0,0,0,.2)}.login-form small{color:#79c5ff;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}.login-form h2{font:700 36px Georgia,serif;margin:12px 0 7px}.login-form p{color:#9fb5c4;margin:0 0 26px}.login-form label{display:grid;gap:7px;margin:14px 0;color:#d8e9f5;font-size:13px;font-weight:900}.login-form input{width:100%;height:52px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;padding:0 14px;font:inherit;outline:none}.login-form input:focus{border-color:#72c1ff;box-shadow:0 0 0 3px rgba(114,193,255,.12)}.login-form button{width:100%;height:54px;border:0;border-radius:14px;background:linear-gradient(135deg,#277ed4,#7bc9ff);color:#03111d;font-weight:1000;font-size:16px;cursor:pointer;margin-top:10px}.login-form button:disabled{opacity:.65;cursor:wait}.error{padding:11px 13px;border-radius:11px;background:rgba(255,80,100,.12);border:1px solid rgba(255,80,100,.25);color:#ffb6c0;font-size:13px}.back{display:block;text-align:center;margin-top:18px;color:#9fcfff;text-decoration:none;font-weight:800}@media(max-width:780px){.login-card{grid-template-columns:1fr}.login-visual{padding:24px}.login-visual img{max-height:220px}.login-form{padding:34px 24px}}
      `}</style>
      <section className="login-card">
        <div className="login-visual">
          <img src="/eterniza/assets/pets/eterniza-pets-institucional.png" alt="Eterniza Pets" />
          <h1>🐾 Eterniza Pets</h1>
          <p>Porque o amor deles também vive para sempre.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <small>Área da clínica</small>
          <h2>Bem-vindo.</h2>
          <p>Entre com o acesso aprovado para sua clínica veterinária.</p>

          {error && <div className="error">{error}</div>}

          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </label>

          <button disabled={loading}>{loading ? "Entrando..." : "Entrar na área da clínica"}</button>
          <a className="back" href="/pets/cadastro">Ainda não possui acesso? Cadastrar clínica</a><a className="back" href="/pets">← Voltar para o Eterniza Pets</a>
        </form>
      </section>
    </main>
  );
}
