"use client";

import { useEffect, useMemo, useState } from "react";
import PetStoryExperience from "../../../components/pets/PetStoryExperience";
import { EXPERIENCE_TYPES, buildPetStory, getStoryDefaults, getStoryQuestions } from "../../../lib/pets/story-engine";

const NAV_ITEMS = [
  ["dashboard", "▦", "Dashboard"],
  ["new", "＋", "Nova experiência"],
  ["experiences", "♥", "Experiências"],
  ["team", "◉", "Equipe"],
  ["reports", "⌁", "Relatórios"],
  ["settings", "⚙", "Configurações"],
];

function moneyFromCents(value) {
  return (Number(value || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function firstName(value) {
  return String(value || "equipe").trim().split(/\s+/)[0] || "equipe";
}

export default function PetsPanelPage() {
  const [active, setActive] = useState("dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [experienceLoading, setExperienceLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pets/dashboard", {
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        if ([401, 403].includes(response.status)) {
          window.location.replace("/pets/login");
          return;
        }

        throw new Error(result.message || "Não foi possível carregar o painel.");
      }

      setData(result);
    } catch (err) {
      setError(err.message || "Não foi possível carregar o painel.");
    } finally {
      setLoading(false);
    }
  }

  async function loadExperiences() {
    setExperienceLoading(true);
    try {
      const response = await fetch("/api/pets/experiences", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) setExperiences(result.experiences || []);
    } finally {
      setExperienceLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadExperiences();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/pets/login");
  }

  function navigate(section) {
    setActive(section);
    setMenuOpen(false);
  }

  const sectionTitle = useMemo(() => {
    return NAV_ITEMS.find(([id]) => id === active)?.[2] || "Dashboard";
  }, [active]);

  if (loading) {
    return (
      <main className="pets-loading-page">
        <Style />
        <div className="loading-card">
          <div className="loading-logo">🐾</div>
          <strong>Carregando sua clínica...</strong>
          <span>Preparando pacote, equipe e experiências.</span>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="pets-loading-page">
        <Style />
        <div className="loading-card error-card">
          <div className="loading-logo">!</div>
          <strong>Não foi possível abrir o painel.</strong>
          <span>{error || "Tente novamente em alguns instantes."}</span>
          <button onClick={loadDashboard}>Tentar novamente</button>
        </div>
      </main>
    );
  }

  const clinic = data.clinic || {};
  const user = data.user || {};
  const metrics = data.metrics || {};
  const packageInfo = data.package || {};
  const accent = clinic.primaryColor || "#277ed4";

  return (
    <main className="pets-app" style={{ "--pet-accent": accent }}>
      <Style />

      <aside className={`pets-sidebar ${menuOpen ? "open" : ""}`}>
        <a className="pets-brand" href="/pets">
          <div className="brand-mark">
            {clinic.logoUrl ? (
              <img src={clinic.logoUrl} alt={clinic.tradeName || "Clínica"} />
            ) : (
              <span>🐾</span>
            )}
          </div>
          <div>
            <strong>{clinic.tradeName || "Eterniza Pets"}</strong>
            <small>{clinic.code || "Área da clínica"}</small>
          </div>
        </a>

        <nav>
          {NAV_ITEMS.map(([id, icon, label]) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => navigate(id)}
            >
              <span>{icon}</span>
              <b>{label}</b>
              {id === "reports" && <em>Em breve</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-package">
          <small>Pacote atual</small>
          <strong>{packageInfo.name || "Pacote mensal"}</strong>
          <span>{packageInfo.limit > 0 ? `${packageInfo.limit} experiências` : "Limite a definir"}</span>
        </div>

        <div className="sidebar-footer">
          <div className="user-mini">
            <span>{firstName(user.name).slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user.name || "Usuário"}</strong>
              <small>{String(user.role || "").replaceAll("_", " ")}</small>
            </div>
          </div>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>

      {menuOpen && <button className="menu-overlay" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <section className="pets-workspace">
        <header className="pets-topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">☰</button>
          <div>
            <span className="eyebrow">Eterniza Pets</span>
            <h1>{sectionTitle}</h1>
          </div>
          <div className="topbar-actions">
            <button className="secondary-action" onClick={loadDashboard}>Atualizar</button>
            <button className="primary-action" onClick={() => navigate("new")}>＋ Nova experiência</button>
          </div>
        </header>

        {active === "dashboard" && (
          <Dashboard
            data={data}
            onNavigate={navigate}
          />
        )}

        {active === "new" && (
          <NewExperienceWizard
            clinic={data.clinic}
            packageInfo={data.package}
            onSaved={async (experience) => {
              await Promise.all([loadDashboard(), loadExperiences()]);
              setNotice({
                title: experience.status === "PUBLISHED" ? "Experiência publicada" : "Rascunho salvo",
                text: experience.status === "PUBLISHED"
                  ? "O link já está pronto para compartilhar com o tutor."
                  : "Você pode publicar este rascunho pela lista de experiências.",
                url: experience.status === "PUBLISHED" ? experience.publicUrl : null,
              });
              navigate("experiences");
            }}
          />
        )}

        {active === "experiences" && (
          <ExperiencesList
            items={experiences}
            loading={experienceLoading}
            onReload={async () => {
              await Promise.all([loadDashboard(), loadExperiences()]);
            }}
            setNotice={setNotice}
          />
        )}

        {active === "team" && (
          <TeamManager
            currentUser={user}
            setNotice={setNotice}
            onChanged={loadDashboard}
          />
        )}

        {active === "settings" && (
          <SettingsManager
            setNotice={setNotice}
            onChanged={loadDashboard}
          />
        )}

        {active === "reports" && (
          <ComingSoon
            section={active}
            title={sectionTitle}
            onBack={() => navigate("dashboard")}
          />
        )}

        {notice && (
          <div className="notice-overlay">
            <div className="notice-card">
              <span>✓</span>
              <h2>{notice.title}</h2>
              <p>{notice.text}</p>
              {notice.url && <a href={notice.url} target="_blank" rel="noreferrer">Abrir experiência</a>}
              <button onClick={() => setNotice(null)}>Entendi</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Dashboard({ data, onNavigate }) {
  const clinic = data.clinic || {};
  const user = data.user || {};
  const metrics = data.metrics || {};
  const packageInfo = data.package || {};
  const recent = Array.isArray(data.recent) ? data.recent : [];

  const remainingText =
    packageInfo.remaining === null
      ? "Ilimitado"
      : Number(packageInfo.remaining || 0).toLocaleString("pt-BR");

  return (
    <div className="dashboard-stack">
      <section className="welcome-card">
        <div>
          <span className="eyebrow">{clinic.code || "Clínica aprovada"}</span>
          <h2>Olá, {firstName(user.name)}.</h2>
          <p>
            Bem-vindo ao painel da <b>{clinic.tradeName || "sua clínica"}</b>.
            Aqui você acompanha o pacote, a equipe e as experiências enviadas aos tutores.
          </p>
          <div className="welcome-actions">
            <button className="primary-action" onClick={() => onNavigate("new")}>＋ Criar nova experiência</button>
            <button className="secondary-action" onClick={() => onNavigate("experiences")}>Ver experiências</button>
          </div>
        </div>

        <div className="welcome-visual">
          <img
            src="/eterniza/assets/pets/eterniza-pets-institucional.png"
            alt="Eterniza Pets"
          />
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          icon="♥"
          value={metrics.publishedThisMonth || 0}
          label="Experiências no mês"
          detail="Publicadas para tutores"
        />
        <MetricCard
          icon="✎"
          value={metrics.draftThisMonth || 0}
          label="Rascunhos"
          detail="Em preparação"
        />
        <MetricCard
          icon="◉"
          value={metrics.teamMembers || 0}
          label="Equipe"
          detail="Usuários vinculados"
        />
        <MetricCard
          icon="◎"
          value={Number(metrics.viewsThisMonth || 0).toLocaleString("pt-BR")}
          label="Visualizações"
          detail="Neste mês"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel package-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Pacote mensal</span>
              <h3>{packageInfo.name || "Pacote mensal"}</h3>
            </div>
            <strong>{moneyFromCents(packageInfo.priceCents)}</strong>
          </div>

          <div className="package-numbers">
            <div>
              <span>Consumidas</span>
              <strong>{packageInfo.used || 0}</strong>
            </div>
            <div>
              <span>Restantes</span>
              <strong>{remainingText}</strong>
            </div>
            <div>
              <span>Limite</span>
              <strong>{packageInfo.limit > 0 ? packageInfo.limit : "—"}</strong>
            </div>
          </div>

          <div className="progress-track">
            <i style={{ width: `${Number(packageInfo.progress || 0)}%` }} />
          </div>

          <div className="package-footer">
            <span>{Number(packageInfo.progress || 0).toFixed(0)}% utilizado</span>
            <span>Vencimento: dia {packageInfo.billingDay || 10}</span>
          </div>
        </article>

        <article className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Atalhos</span>
              <h3>O que deseja fazer?</h3>
            </div>
          </div>

          <div className="quick-grid">
            <QuickAction icon="＋" title="Nova experiência" text="Comece um novo momento." onClick={() => onNavigate("new")} />
            <QuickAction icon="♥" title="Experiências" text="Veja publicadas e rascunhos." onClick={() => onNavigate("experiences")} />
            <QuickAction icon="◉" title="Equipe" text="Gerencie os acessos." onClick={() => onNavigate("team")} />
            <QuickAction icon="⚙" title="Configurações" text="Logo, cor e assinatura." onClick={() => onNavigate("settings")} />
          </div>
        </article>
      </section>

      <section className="dashboard-grid lower">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Atividade</span>
              <h3>Experiências recentes</h3>
            </div>
            <button className="text-button" onClick={() => onNavigate("experiences")}>Ver todas</button>
          </div>

          {recent.length ? (
            <div className="recent-list">
              {recent.map((item) => (
                <div className="recent-row" key={item.id}>
                  <span className="recent-icon">{item.icon || "🐾"}</span>
                  <div>
                    <strong>{item.petName || "Experiência"}</strong>
                    <small>{item.type || "Momento especial"}</small>
                  </div>
                  <em>{item.status || "RASCUNHO"}</em>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🐾</span>
              <h4>Nenhuma experiência criada ainda.</h4>
              <p>Na próxima etapa, o assistente permitirá criar a primeira experiência em poucos minutos.</p>
              <button className="primary-action" onClick={() => onNavigate("new")}>Começar primeira experiência</button>
            </div>
          )}
        </article>

        <article className="panel brand-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Identidade</span>
              <h3>Como sua clínica aparece</h3>
            </div>
          </div>

          <div className="brand-preview">
            <div className="clinic-logo-preview">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.tradeName || "Clínica"} />
              ) : (
                <span>🏥</span>
              )}
            </div>
            <strong>{clinic.tradeName || "Sua clínica"}</strong>
            <small>
              {clinic.city && clinic.state
                ? `${clinic.city} / ${clinic.state}`
                : "Localização da clínica"}
            </small>

            <div className="brand-partnership">
              <span>Em parceria com</span>
              <b>🐾 Eterniza Pets</b>
            </div>
          </div>

          <button className="secondary-action full" onClick={() => onNavigate("settings")}>
            Configurar identidade visual
          </button>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ icon, value, label, detail }) {
  return (
    <article className="metric-card">
      <span className="metric-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function QuickAction({ icon, title, text, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </button>
  );
}




function specialDateLabel(type) {
  const labels = {
    FAREWELL: "Data da despedida (opcional)",
    SURGERY: "Data da cirurgia (opcional)",
    RECOVERY: "Data da recuperação (opcional)",
    DISCHARGE: "Data da alta (opcional)",
    BIRTHDAY: "Data do aniversário (opcional)",
    ADOPTION: "Data da adoção (opcional)",
    VACCINATION: "Data da vacinação (opcional)",
    CUSTOM: "Data do momento (opcional)",
  };
  return labels[type] || "Data do momento (opcional)";
}

function specialDateHelp(type) {
  const helps = {
    FAREWELL: "Quando aconteceu a despedida.",
    SURGERY: "Quando o procedimento foi realizado.",
    RECOVERY: "Quando essa etapa da recuperação aconteceu.",
    DISCHARGE: "Quando o pet recebeu alta.",
    BIRTHDAY: "A data do aniversário ou comemoração.",
    ADOPTION: "Quando o pet chegou à nova família.",
    VACCINATION: "Quando a vacinação foi realizada.",
    CUSTOM: "Uma data ligada ao momento eternizado.",
  };
  return helps[type] || helps.CUSTOM;
}

function emptyExperience() {
  return {
    type: "",
    petName: "",
    species: "Canino",
    breed: "",
    tutorName: "",
    tutorPhone: "",
    title: "",
    specialDate: "",
    message: "",
    musicUrl: "",
    themeColor: "#277ed4",
    photos: [],
    storyAnswers: {},
    storyData: null,
  };
}

function NewExperienceWizard({ clinic, packageInfo, onSaved }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({ ...emptyExperience(), themeColor: clinic?.primaryColor || "#277ed4" }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [youtubeQuery, setYoutubeQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeMessage, setYoutubeMessage] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function searchYoutube() {
    const query = youtubeQuery.trim();
    if (query.length < 2) {
      setYoutubeMessage("Digite o nome da música ou artista.");
      return;
    }
    setYoutubeLoading(true);
    setYoutubeMessage("");
    try {
      const response = await fetch(`/api/pets/youtube/search?q=${encodeURIComponent(query)}`, { cache:"no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Busca indisponível.");
      setYoutubeResults(result.results || []);
      setYoutubeMessage((result.results || []).length ? "" : "Nenhuma música encontrada.");
    } catch (err) {
      setYoutubeMessage(err.message || "Não foi possível buscar agora.");
    } finally {
      setYoutubeLoading(false);
    }
  }

  function selectYoutube(item) {
    update("musicUrl", item.url);
    setYoutubeMessage(`Selecionada: ${item.title}`);
  }

  function selectType(type) {
    const defaults = getStoryDefaults(type.id, {
      petName: form.petName,
      storyAnswers: {},
    });
    setForm((current) => ({
      ...current,
      type: type.id,
      title: defaults.title,
      message: defaults.message,
      themeColor: defaults.themeColor,
      storyAnswers: {},
      storyData: null,
    }));
    setYoutubeQuery(defaults.suggestedMusicQuery || "");
    setStep(2);
  }

  function updateStoryAnswer(questionId, value) {
    setForm((current) => {
      const storyAnswers = {
        ...(current.storyAnswers || {}),
        [questionId]: value,
      };
      const defaults = getStoryDefaults(current.type, {
        ...current,
        storyAnswers,
      });
      return {
        ...current,
        storyAnswers,
        title: defaults.title,
        message: defaults.message,
        themeColor: defaults.themeColor,
        storyData: null,
      };
    });
  }

  function currentStory() {
    return buildPetStory({
      ...form,
      storyAnswers: form.storyAnswers || {},
    });
  }

  async function handlePhotos(files) {
    const selected = Array.from(files || []).slice(0, Math.max(0, 5 - form.photos.length));
    const compressed = [];

    for (const file of selected) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      compressed.push(await compressImage(file));
    }

    setForm((current) => ({
      ...current,
      photos: [...current.photos, ...compressed].slice(0, 5),
    }));
  }

  async function save(action) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/pets/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, storyData: currentStory(), action }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível salvar.");

      onSaved(result.experience);
      setForm({ ...emptyExperience(), themeColor: clinic?.primaryColor || "#277ed4" });
      setStep(1);
    } catch (err) {
      setError(err.message || "Não foi possível salvar a experiência.");
    } finally {
      setSaving(false);
    }
  }

  const canNext =
    step === 2
      ? form.petName.trim() && form.tutorName.trim()
      : step === 3
        ? form.message.trim()
        : true;

  return (
    <section className="wizard-shell">
      <div className="wizard-head">
        <div>
          <span className="eyebrow">Assistente de criação</span>
          <h2>{step === 1 ? "Qual momento deseja eternizar?" : step === 2 ? "Quem viverá esta experiência?" : step === 3 ? "Mensagem e detalhes" : "Conferir e publicar"}</h2>
          <p>Etapa {step} de 4 · {packageInfo?.remaining === null ? "Pacote ilimitado" : `${packageInfo?.remaining ?? 0} experiências restantes`}</p>
        </div>
        <div className="wizard-progress"><i style={{ width: `${step * 25}%` }} /></div>
      </div>

      {step === 1 && (
        <div className="type-grid">
          {EXPERIENCE_TYPES.map((type) => (
            <button key={type.id} className="type-card" onClick={() => selectType(type)}>
              <span>{type.icon}</span><strong>{type.title}</strong><small>{type.text}</small>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="wizard-card">
          <div className="form-grid">
            <label>Nome do pet<input value={form.petName} onChange={(e) => update("petName", e.target.value)} autoFocus /></label>
            <label>Nome do tutor<input value={form.tutorName} onChange={(e) => update("tutorName", e.target.value)} /></label>
            <label>Espécie<select value={form.species} onChange={(e) => update("species", e.target.value)}><option>Canino</option><option>Felino</option><option>Ave</option><option>Outro</option></select></label>
            <label>Raça (opcional)<input value={form.breed} onChange={(e) => update("breed", e.target.value)} /></label>
            <label>WhatsApp do tutor (opcional)<input inputMode="tel" value={form.tutorPhone} onChange={(e) => update("tutorPhone", e.target.value)} /></label>
            <label>
              {specialDateLabel(form.type)}
              <input type="date" value={form.specialDate} onChange={(e) => update("specialDate", e.target.value)} />
              <small className="field-help">{specialDateHelp(form.type)}</small>
            </label>
          </div>

          {!!getStoryQuestions(form.type).length && (
            <div className="story-questions">
              <div className="story-questions-head">
                <span className="eyebrow">Roteiro inteligente</span>
                <h3>Conte um pouco sobre este momento</h3>
                <p>As respostas mudam a abertura, os capítulos e a carta sugerida.</p>
              </div>

              {getStoryQuestions(form.type).map((question) => (
                <div className="story-question" key={question.id}>
                  <strong>{question.label}</strong>

                  {question.type === "choice" && (
                    <div className="story-options">
                      {question.options.map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          className={(form.storyAnswers?.[question.id] || "") === value ? "selected" : ""}
                          onClick={() => updateStoryAnswer(question.id, value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === "text" && (
                    <input
                      value={form.storyAnswers?.[question.id] || ""}
                      placeholder={question.placeholder || ""}
                      onChange={(event) => updateStoryAnswer(question.id, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="wizard-card">
          <div className="form-grid one">
            <label>Título da experiência<input value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
            <label>Mensagem<textarea rows="8" value={form.message} onChange={(e) => update("message", e.target.value)} /></label>
          </div>
          <div className="form-grid">
            <div className="youtube-search-field">
              <label>Música no YouTube</label><small className="music-suggestion">Sugestão para este momento: {currentStory().suggestedMusicQuery}</small>
              <div className="youtube-search-row">
                <input value={youtubeQuery} onChange={(e) => setYoutubeQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchYoutube())} placeholder="Ex.: piano emocionante, música do artista..." />
                <button type="button" className="secondary-action" onClick={searchYoutube} disabled={youtubeLoading}>{youtubeLoading ? "Buscando..." : "Buscar"}</button>
              </div>
              {youtubeMessage && <small className="youtube-message">{youtubeMessage}</small>}
              {!!youtubeResults.length && (
                <div className="youtube-results">
                  {youtubeResults.map((item) => (
                    <button type="button" key={item.id} className={`youtube-result ${form.musicUrl === item.url ? "selected" : ""}`} onClick={() => selectYoutube(item)}>
                      <img src={item.thumb} alt="" />
                      <span><strong>{item.title}</strong><small>{item.channel}</small></span>
                      <b>{form.musicUrl === item.url ? "✓" : "Escolher"}</b>
                    </button>
                  ))}
                </div>
              )}
              {form.musicUrl && <div className="selected-music">🎵 Música selecionada <button type="button" onClick={() => update("musicUrl", "")}>Remover</button></div>}
            </div>
            <label>Cor principal<input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} /></label>
          </div>
          <label className="photo-picker">
            <input type="file" accept="image/*" multiple onChange={(e) => handlePhotos(e.target.files)} />
            <span>＋ Adicionar fotos</span>
            <small>Até 5 fotos. Elas serão comprimidas automaticamente.</small>
          </label>
          {!!form.photos.length && (
            <div className="wizard-photos">
              {form.photos.map((photo, index) => (
                <div key={index}>
                  <img src={photo.dataUrl} alt="" />
                  <button onClick={() => update("photos", form.photos.filter((_, i) => i !== index))}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="review-grid">
          <article className="review-preview" style={{ "--preview-accent": form.themeColor }}>
            <span>{EXPERIENCE_TYPES.find((item) => item.id === form.type)?.icon || "🐾"}</span>
            <small>{clinic?.tradeName}</small>
            <h3>{form.petName}</h3>
            <b>{form.title}</b>
            {!!form.photos[0] && <img src={form.photos[0].dataUrl} alt={form.petName} />}
            <p>{form.message}</p>
            <button className="primary-action preview-button" onClick={() => setPreviewOpen(true)}>
              ▶ Visualizar como o tutor verá
            </button>
          </article>
          <article className="review-summary">
            <span className="eyebrow">Resumo</span>
            <h3>Confira antes de publicar.</h3>
            <dl>
              <div><dt>Momento</dt><dd>{EXPERIENCE_TYPES.find((item) => item.id === form.type)?.title}</dd></div>
              <div><dt>Pet</dt><dd>{form.petName}</dd></div>
              <div><dt>Tutor</dt><dd>{form.tutorName}</dd></div>
              <div><dt>Fotos</dt><dd>{form.photos.length}</dd></div>
              <div><dt>Música</dt><dd>{form.musicUrl ? "Selecionada" : "Sem música"}</dd></div>
              <div><dt>Roteiro</dt><dd>{Object.keys(form.storyAnswers || {}).length} resposta(s)</dd></div>
            </dl>
            <p>Abra a prévia completa. A publicação usará exatamente o mesmo visual, música e animações.</p>
          </article>
        </div>
      )}

      {previewOpen && (
          <PetStoryExperience
            preview
            onClose={() => setPreviewOpen(false)}
            experience={{
              ...form,
              storyData: currentStory(),
              clinic: {
                tradeName: clinic?.tradeName,
                logoUrl: clinic?.logoUrl || "/eterniza/assets/pets/brands/logo-onda-card.png",
                primaryColor: clinic?.primaryColor,
                signature: clinic?.signature,
                showEternizaBrand: clinic?.showEternizaBrand,
                showEternizaCta: clinic?.showEternizaCta,
              },
            }}
          />
        )}

      {error && <div className="wizard-error">{error}</div>}

      {step > 1 && (
        <div className="wizard-actions">
          <button className="secondary-action" disabled={saving} onClick={() => setStep((current) => current - 1)}>Voltar</button>
          {step < 4 ? (
            <button className="primary-action" disabled={!canNext || saving} onClick={() => setStep((current) => current + 1)}>Continuar</button>
          ) : (
            <>
              <button className="secondary-action" disabled={saving} onClick={() => save("DRAFT")}>{saving ? "Salvando..." : "Salvar rascunho"}</button>
              <button className="primary-action" disabled={saving} onClick={() => save("PUBLISH")}>{saving ? "Publicando..." : "Publicar experiência"}</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

async function compressImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const max = 1200;
  const ratio = Math.min(1, max / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  return {
    name: file.name,
    dataUrl: canvas.toDataURL("image/jpeg", 0.72),
  };
}

function ExperiencesList({ items, loading, onReload, setNotice }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  async function copyPublicLink(item) {
    const url = `${window.location.origin}${item.publicUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice({ title:"Link copiado", text:"O link da experiência foi copiado para a área de transferência.", url:item.publicUrl });
    } catch {
      setNotice({ title:"Não foi possível copiar", text:url });
    }
  }

  async function sharePublicLink(item) {
    const url = `${window.location.origin}${item.publicUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title:`Experiência de ${item.petName}`, text:item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice({ title:"Link copiado", text:"Seu navegador não possui o menu nativo; o link foi copiado.", url:item.publicUrl });
      }
    } catch (error) {
      if (error?.name !== "AbortError") setNotice({ title:"Não foi possível compartilhar", text:"Tente copiar o link." });
    }
  }

  async function action(id, action) {
    const response = await fetch(`/api/pets/experiences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      setNotice({ title: "Não foi possível atualizar", text: result.message || "Tente novamente." });
      return;
    }

    await onReload();
    setNotice({
      title: action === "PUBLISH" ? "Experiência publicada" : "Experiência arquivada",
      text: action === "PUBLISH" ? "O link já está disponível para compartilhar." : "A experiência foi arquivada.",
      url: action === "PUBLISH" ? `/pets/experiencia/${result.experience.slug}` : null,
    });
  }

  async function remove() {
    if (!deleteTarget?.id) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/pets/experiences/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Não foi possível remover.");
      }

      setDeleteTarget(null);
      await onReload();

      setNotice({
        title: "Experiência removida",
        text: "Ela saiu da lista, mas o uso do pacote continua contabilizado.",
      });
    } catch (error) {
      setNotice({
        title: "Não foi possível remover",
        text: error.message || "Tente novamente.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="experiences-shell">
      <div className="section-heading-pet">
        <div><span className="eyebrow">Gestão</span><h2>Experiências da clínica</h2><p>Rascunhos, publicadas e histórico.</p></div>
        <button className="secondary-action" onClick={onReload}>Atualizar</button>
      </div>

      {loading ? <div className="experience-empty">Carregando...</div> : items.length ? (
        <div className="experience-list">
          {items.map((item) => {
            const type = EXPERIENCE_TYPES.find((type) => type.id === item.type);
            return <article className="experience-card" key={item.id}>
              <div className="experience-cover">
                {item.photos?.[0]?.dataUrl ? <img src={item.photos[0].dataUrl} alt={item.petName} /> : <span>{type?.icon || "🐾"}</span>}
              </div>
              <div className="experience-info">
                <small>{type?.title || "Personalizada"}</small>
                <h3>{item.petName}</h3>
                <p>Tutor: {item.tutorName}</p>
                <em className={`experience-status ${item.status.toLowerCase()}`}>{item.status}</em>
              </div>
              <div className="experience-actions">
                {item.status === "PUBLISHED" && <a href={item.publicUrl} target="_blank" rel="noreferrer">Abrir</a>}
                {item.status === "PUBLISHED" && <button onClick={() => sharePublicLink(item)}>Compartilhar</button>}
                {item.status === "PUBLISHED" && <button onClick={() => copyPublicLink(item)}>Copiar link</button>}
                {item.status === "DRAFT" && <button onClick={() => action(item.id, "PUBLISH")}>Publicar</button>}
                {item.status === "PUBLISHED" && <button className="danger-mini" onClick={() => action(item.id, "ARCHIVE")}>Arquivar</button>}
                {["DRAFT", "ARCHIVED"].includes(item.status) && (
                  <button className="danger-mini" onClick={() => setDeleteTarget(item)}>Remover</button>
                )}
              </div>
            </article>;
          })}
        </div>
      ) : (
        <div className="experience-empty"><span>🐾</span><h3>Nenhuma experiência criada.</h3><p>Use o botão “Nova experiência” para começar.</p></div>
      )}

      {deleteTarget && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-card">
            <span>🗑️</span>
            <h3>Remover esta experiência?</h3>
            <p>
              <b>{deleteTarget.petName}</b> será removido da lista da clínica.
              Caso já tenha sido publicado, o uso continuará contabilizado no pacote mensal.
            </p>
            <div>
              <button className="secondary-action" disabled={deleting} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="delete-confirm-button" disabled={deleting} onClick={remove}>
                {deleting ? "Removendo..." : "Remover experiência"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


const TEAM_PERMISSION_OPTIONS = [
  ["experiences.view", "Visualizar experiências"],
  ["experiences.create", "Criar experiências"],
  ["experiences.edit", "Editar experiências"],
  ["experiences.publish", "Publicar experiências"],
  ["experiences.delete", "Excluir experiências"],
  ["team.view", "Visualizar equipe"],
  ["team.manage", "Gerenciar equipe"],
  ["reports.view", "Acessar relatórios"],
  ["settings.view", "Visualizar configurações"],
  ["settings.manage", "Alterar configurações"],
];

function emptyTeamMember() {
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CLINIC_STAFF",
    clinicTitle: "Recepção",
    notes: "",
    isActive: true,
    permissions: {
      experiences: { view: true, create: true, edit: true, publish: true, delete: false },
      team: { view: false, manage: false },
      reports: { view: false },
      settings: { view: false, manage: false },
    },
  };
}

function getPermissionValue(permissions, key) {
  const [group, action] = key.split(".");
  return Boolean(permissions?.[group]?.[action]);
}

function setPermissionValue(permissions, key, value) {
  const [group, action] = key.split(".");
  return {
    ...(permissions || {}),
    [group]: {
      ...(permissions?.[group] || {}),
      [action]: value,
    },
  };
}

function formatTeamPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function TeamManager({ currentUser, setNotice, onChanged }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [canManage, setCanManage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(currentUser?.id || "");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyTeamMember());
  const [formError, setFormError] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  async function loadTeam() {
    setLoading(true);
    try {
      const response = await fetch("/api/pets/team", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível carregar a equipe.");
      setMembers(result.members || []);
      setCanManage(Boolean(result.canManage));
      setCurrentUserId(result.currentUserId || currentUser?.id || "");
    } catch (error) {
      setNotice({ title: "Não foi possível carregar", text: error.message || "Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTeam(); }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return members.filter((member) => {
      const statusOk = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? member.isActive : !member.isActive);
      const searchOk = !search || [member.name, member.email, member.phone, member.clinicTitle]
        .some((value) => String(value || "").toLowerCase().includes(search));
      return statusOk && searchOk;
    });
  }, [members, query, statusFilter]);

  function openCreate() {
    setForm(emptyTeamMember());
    setFormError("");
    setModal("CREATE");
  }

  function openEdit(member) {
    setForm({ ...emptyTeamMember(), ...member, password: "" });
    setFormError("");
    setModal("EDIT");
  }

  async function saveMember() {
    setSaving(true);
    setFormError("");
    try {
      const editing = modal === "EDIT";
      const response = await fetch(editing ? `/api/pets/team/${form.id}` : "/api/pets/team", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível salvar.");
      setModal(null);
      await Promise.all([loadTeam(), onChanged?.()]);
      setNotice({ title: editing ? "Integrante atualizado" : "Integrante cadastrado", text: "As alterações já estão disponíveis no painel." });
    } catch (error) {
      setFormError(error.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(member) {
    setSaving(true);
    try {
      const response = await fetch(`/api/pets/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_STATUS" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível alterar o acesso.");
      setConfirmTarget(null);
      await Promise.all([loadTeam(), onChanged?.()]);
      setNotice({ title: result.member.isActive ? "Acesso ativado" : "Acesso desativado", text: `${member.name} ${result.member.isActive ? "já pode entrar novamente." : "não poderá mais entrar no painel."}` });
    } catch (error) {
      setNotice({ title: "Não foi possível alterar", text: error.message || "Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (!passwordTarget) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/pets/team/${passwordTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_PASSWORD", password: newPassword }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível alterar a senha.");
      setPasswordTarget(null);
      setNewPassword("");
      setNotice({ title: "Senha atualizada", text: `Uma nova senha foi definida para ${passwordTarget.name}.` });
    } catch (error) {
      setNotice({ title: "Não foi possível alterar a senha", text: error.message || "Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="team-shell">
      <div className="section-heading-pet team-heading">
        <div><span className="eyebrow">Acessos da clínica</span><h2>Equipe e permissões</h2><p>Cadastre integrantes, defina funções e controle o que cada pessoa pode acessar.</p></div>
        {canManage && <button className="primary-action" onClick={openCreate}>＋ Novo integrante</button>}
      </div>

      <div className="team-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, e-mail ou função..." />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="ALL">Todos os acessos</option>
          <option value="ACTIVE">Somente ativos</option>
          <option value="INACTIVE">Somente inativos</option>
        </select>
        <button className="secondary-action" onClick={loadTeam}>Atualizar</button>
      </div>

      <div className="team-summary">
        <div><strong>{members.length}</strong><span>integrantes</span></div>
        <div><strong>{members.filter((item) => item.isActive).length}</strong><span>ativos</span></div>
        <div><strong>{members.filter((item) => item.role === "CLINIC_MANAGER" && item.isActive).length}</strong><span>administradores</span></div>
      </div>

      {loading ? <div className="experience-empty">Carregando equipe...</div> : filtered.length ? (
        <div className="team-grid">
          {filtered.map((member) => (
            <article className={`team-card ${member.isActive ? "" : "inactive"}`} key={member.id}>
              <div className="team-avatar">{firstName(member.name).slice(0, 1).toUpperCase()}</div>
              <div className="team-card-main">
                <div className="team-card-title"><h3>{member.name}</h3><em className={member.isActive ? "active" : "inactive"}>{member.isActive ? "Ativo" : "Inativo"}</em></div>
                <strong>{member.clinicTitle || (member.role === "CLINIC_MANAGER" ? "Administrador" : "Equipe")}</strong>
                <a href={`mailto:${member.email}`}>{member.email}</a>
                {member.phone && <span>{formatTeamPhone(member.phone)}</span>}
                <small>{member.role === "CLINIC_MANAGER" ? "Administrador da clínica" : "Acesso personalizado"}{member.id === currentUserId ? " · Você" : ""}</small>
              </div>
              {canManage && (
                <div className="team-card-actions">
                  <button onClick={() => openEdit(member)}>Editar</button>
                  <button onClick={() => { setPasswordTarget(member); setNewPassword(""); }}>Nova senha</button>
                  <button className={member.isActive ? "danger-mini" : "success-mini"} disabled={member.id === currentUserId} onClick={() => setConfirmTarget(member)}>{member.isActive ? "Desativar" : "Ativar"}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : <div className="experience-empty"><span>◉</span><h3>Nenhum integrante encontrado.</h3><p>Ajuste a busca ou cadastre uma nova pessoa.</p></div>}

      {modal && (
        <div className="team-modal-overlay">
          <div className="team-modal-card">
            <div className="team-modal-head"><div><span className="eyebrow">{modal === "EDIT" ? "Editar acesso" : "Novo acesso"}</span><h3>{modal === "EDIT" ? form.name : "Cadastrar integrante"}</h3></div><button onClick={() => setModal(null)}>×</button></div>
            <div className="team-form-grid">
              <label>Nome completo<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>E-mail de acesso<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>Telefone<input inputMode="tel" value={formatTeamPhone(form.phone)} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, "") })} /></label>
              <label>Função na clínica<input value={form.clinicTitle} onChange={(event) => setForm({ ...form, clinicTitle: event.target.value })} placeholder="Ex.: Veterinário, Recepção" /></label>
              <label>Perfil de acesso<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="CLINIC_STAFF">Integrante da equipe</option><option value="CLINIC_MANAGER">Administrador</option></select></label>
              {modal === "CREATE" && <label>Senha inicial<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>}
              <label className="team-notes">Observações internas<textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
            </div>

            <div className="permission-box">
              <div><strong>Permissões</strong><small>Administradores recebem todas as permissões automaticamente.</small></div>
              <div className="permission-grid">
                {TEAM_PERMISSION_OPTIONS.map(([key, label]) => (
                  <label key={key} className={form.role === "CLINIC_MANAGER" ? "disabled" : ""}>
                    <input type="checkbox" disabled={form.role === "CLINIC_MANAGER"} checked={form.role === "CLINIC_MANAGER" || getPermissionValue(form.permissions, key)} onChange={(event) => setForm({ ...form, permissions: setPermissionValue(form.permissions, key, event.target.checked) })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {formError && <div className="wizard-error">{formError}</div>}
            <div className="team-modal-actions"><button className="secondary-action" disabled={saving} onClick={() => setModal(null)}>Cancelar</button><button className="primary-action" disabled={saving} onClick={saveMember}>{saving ? "Salvando..." : "Salvar integrante"}</button></div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="delete-confirm-overlay"><div className="delete-confirm-card"><span>{confirmTarget.isActive ? "🔒" : "🔓"}</span><h3>{confirmTarget.isActive ? "Desativar acesso?" : "Ativar acesso?"}</h3><p><b>{confirmTarget.name}</b> {confirmTarget.isActive ? "não poderá mais entrar no painel até ser ativado novamente." : "voltará a poder acessar o painel da clínica."}</p><div><button className="secondary-action" disabled={saving} onClick={() => setConfirmTarget(null)}>Cancelar</button><button className={confirmTarget.isActive ? "delete-confirm-button" : "primary-action"} disabled={saving} onClick={() => toggleStatus(confirmTarget)}>{saving ? "Aguarde..." : confirmTarget.isActive ? "Desativar acesso" : "Ativar acesso"}</button></div></div></div>
      )}

      {passwordTarget && (
        <div className="team-modal-overlay"><div className="team-password-card"><span>🔑</span><h3>Definir nova senha</h3><p>Crie uma nova senha para <b>{passwordTarget.name}</b>.</p><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" autoFocus /><div><button className="secondary-action" disabled={saving} onClick={() => setPasswordTarget(null)}>Cancelar</button><button className="primary-action" disabled={saving || newPassword.length < 6} onClick={resetPassword}>{saving ? "Salvando..." : "Atualizar senha"}</button></div></div></div>
      )}
    </section>
  );
}

function SettingsManager({ setNotice, onChanged }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState("clinic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  async function loadSettings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/pets/settings", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível carregar as configurações.");
      setSettings(result.settings);
      setForm(result.settings);
    } catch (err) {
      setError(err.message || "Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSettings(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/pets/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível salvar.");
      setSettings(result.settings);
      setForm(result.settings);
      await onChanged?.();
      setNotice({ title: "Configurações atualizadas", text: "Os dados da clínica já foram salvos e estão ativos no painel." });
    } catch (err) {
      setError(err.message || "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/pets/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Não foi possível alterar a senha.");
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice({ title: "Senha atualizada", text: "Sua nova senha já está ativa para os próximos acessos." });
    } catch (err) {
      setError(err.message || "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="experience-empty">Carregando configurações...</div>;
  if (!form) return <div className="experience-empty"><span>⚙</span><h3>Configurações indisponíveis</h3><p>{error || "Você não possui acesso a esta área."}</p></div>;

  const canManage = Boolean(settings?.canManage);
  const tabs = [
    ["clinic", "🏥", "Clínica"],
    ["branding", "🎨", "Aparência"],
    ["preferences", "✨", "Preferências"],
    ["security", "🔐", "Segurança"],
    ["plan", "💳", "Plano"],
  ];

  return (
    <section className="settings-shell">
      <div className="section-heading-pet settings-heading">
        <div><span className="eyebrow">Personalização e conta</span><h2>Configurações da clínica</h2><p>Atualize os dados exibidos no painel e nas experiências enviadas aos tutores.</p></div>
        {canManage && tab !== "security" && tab !== "plan" && <button className="primary-action" disabled={saving} onClick={saveSettings}>{saving ? "Salvando..." : "Salvar alterações"}</button>}
      </div>

      <div className="settings-layout">
        <nav className="settings-tabs">
          {tabs.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setError(""); }}><span>{icon}</span><b>{label}</b></button>)}
        </nav>

        <div className="settings-content">
          {error && <div className="wizard-error settings-error">{error}</div>}

          {tab === "clinic" && <div className="settings-card"><div className="settings-card-head"><span>🏥</span><div><h3>Dados da clínica</h3><p>Informações institucionais, contatos e endereço.</p></div></div><div className="settings-form-grid">
            <label>Nome fantasia *<input disabled={!canManage} value={form.tradeName || ""} onChange={(e) => update("tradeName", e.target.value)} /></label>
            <label>Razão social *<input disabled={!canManage} value={form.legalName || ""} onChange={(e) => update("legalName", e.target.value)} /></label>
            <label>CNPJ<input disabled value={form.cnpj || ""} /></label>
            <label>Inscrição estadual<input disabled={!canManage} value={form.stateRegistration || ""} onChange={(e) => update("stateRegistration", e.target.value)} /></label>
            <label>E-mail *<input type="email" disabled={!canManage} value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></label>
            <label>Telefone *<input disabled={!canManage} value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} /></label>
            <label>WhatsApp<input disabled={!canManage} value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} /></label>
            <label>Instagram<input disabled={!canManage} value={form.instagram || ""} onChange={(e) => update("instagram", e.target.value)} placeholder="@suaclinica" /></label>
            <label className="settings-wide">Site<input disabled={!canManage} value={form.website || ""} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></label>
            <label>CEP<input disabled={!canManage} value={form.zipCode || ""} onChange={(e) => update("zipCode", e.target.value)} /></label>
            <label>Rua<input disabled={!canManage} value={form.street || ""} onChange={(e) => update("street", e.target.value)} /></label>
            <label>Número<input disabled={!canManage} value={form.number || ""} onChange={(e) => update("number", e.target.value)} /></label>
            <label>Complemento<input disabled={!canManage} value={form.complement || ""} onChange={(e) => update("complement", e.target.value)} /></label>
            <label>Bairro<input disabled={!canManage} value={form.district || ""} onChange={(e) => update("district", e.target.value)} /></label>
            <label>Cidade<input disabled={!canManage} value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></label>
            <label>UF<input maxLength="2" disabled={!canManage} value={form.state || ""} onChange={(e) => update("state", e.target.value.toUpperCase())} /></label>
          </div><div className="settings-divider"/><div className="settings-card-head compact"><span>👤</span><div><h3>Responsável</h3><p>Contato principal da conta da clínica.</p></div></div><div className="settings-form-grid">
            <label>Nome *<input disabled={!canManage} value={form.responsibleName || ""} onChange={(e) => update("responsibleName", e.target.value)} /></label>
            <label>Cargo<input disabled={!canManage} value={form.responsibleRole || ""} onChange={(e) => update("responsibleRole", e.target.value)} /></label>
            <label>Telefone *<input disabled={!canManage} value={form.responsiblePhone || ""} onChange={(e) => update("responsiblePhone", e.target.value)} /></label>
            <label>E-mail *<input type="email" disabled={!canManage} value={form.responsibleEmail || ""} onChange={(e) => update("responsibleEmail", e.target.value)} /></label>
          </div></div>}

          {tab === "branding" && <div className="settings-card"><div className="settings-card-head"><span>🎨</span><div><h3>Identidade visual</h3><p>Defina como a clínica aparece no painel e nas experiências.</p></div></div><div className="branding-settings-grid"><div className="settings-form-grid single">
            <label>URL do logotipo<input disabled={!canManage} value={form.logoUrl || ""} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://.../logo.png" /></label>
            <label>Cor principal<div className="color-field"><input type="color" disabled={!canManage} value={form.primaryColor || "#277ed4"} onChange={(e) => update("primaryColor", e.target.value)} /><input disabled={!canManage} value={form.primaryColor || "#277ed4"} onChange={(e) => update("primaryColor", e.target.value)} /></div></label>
            <label>Assinatura da clínica<textarea rows="4" disabled={!canManage} value={form.signature || ""} onChange={(e) => update("signature", e.target.value)} placeholder="Uma mensagem curta exibida ao tutor." /></label>
          </div><div className="settings-brand-preview" style={{ "--preview-color": form.primaryColor || "#277ed4" }}><small>Prévia</small><div className="settings-preview-logo">{form.logoUrl ? <img src={form.logoUrl} alt="Logo da clínica" /> : <span>🏥</span>}</div><h3>{form.tradeName || "Sua clínica"}</h3><p>{form.signature || "Cuidado que permanece em cada lembrança."}</p><button>Ver experiência</button></div></div></div>}

          {tab === "preferences" && <div className="settings-card"><div className="settings-card-head"><span>✨</span><div><h3>Preferências de exibição</h3><p>Controle as marcas e chamadas exibidas nas experiências.</p></div></div><div className="settings-switches">
            <label><input type="checkbox" disabled={!canManage} checked={form.showEternizaBrand !== false} onChange={(e) => update("showEternizaBrand", e.target.checked)} /><span><strong>Exibir parceria com o Eterniza</strong><small>Mostra a assinatura “Em parceria com Eterniza Pets”.</small></span></label>
            <label><input type="checkbox" disabled={!canManage} checked={form.showEternizaCta !== false} onChange={(e) => update("showEternizaCta", e.target.checked)} /><span><strong>Exibir chamada para conhecer o Eterniza</strong><small>Inclui um botão discreto no fim da experiência.</small></span></label>
          </div><div className="settings-form-grid settings-preference-fields"><label>Texto da chamada<input disabled={!canManage || form.showEternizaCta === false} value={form.eternizaCtaText || ""} onChange={(e) => update("eternizaCtaText", e.target.value)} /></label><label>Link da chamada<input disabled={!canManage || form.showEternizaCta === false} value={form.eternizaCtaUrl || ""} onChange={(e) => update("eternizaCtaUrl", e.target.value)} /></label></div></div>}

          {tab === "security" && <div className="settings-card security-card"><div className="settings-card-head"><span>🔐</span><div><h3>Alterar minha senha</h3><p>A alteração afeta somente o seu próprio acesso.</p></div></div><div className="settings-form-grid single password-settings"><label>Senha atual<input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></label><label>Nova senha<input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} placeholder="Mínimo de 6 caracteres" /></label><label>Confirmar nova senha<input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /></label><button className="primary-action" disabled={saving || !password.currentPassword || password.newPassword.length < 6 || password.newPassword !== password.confirmPassword} onClick={changePassword}>{saving ? "Alterando..." : "Alterar minha senha"}</button></div></div>}

          {tab === "plan" && <div className="settings-card"><div className="settings-card-head"><span>💳</span><div><h3>Plano contratado</h3><p>Informações comerciais administradas pelo Eterniza.</p></div></div><div className="plan-settings-hero"><div><small>Pacote atual</small><h3>{form.monthlyPackageName || "Pacote mensal"}</h3><strong>{moneyFromCents(form.monthlyPriceCents)}</strong></div><em>{form.status === "APPROVED" ? "Ativo" : form.status}</em></div><div className="plan-settings-grid"><div><span>Limite mensal</span><strong>{Number(form.monthlyTributeLimit || 0) > 0 ? `${form.monthlyTributeLimit} experiências` : "A definir"}</strong></div><div><span>Dia de vencimento</span><strong>Dia {form.billingDay || 10}</strong></div><div><span>Código da clínica</span><strong>{form.code}</strong></div></div><p className="plan-readonly-note">Para alterar pacote, limite ou cobrança, entre em contato com o atendimento do Eterniza.</p></div>}
        </div>
      </div>
    </section>
  );
}

function ComingSoon({ section, title, onBack }) {
  const content = {
    new: ["Qual momento deseja eternizar?", "O assistente de criação entra na v60.2."],
    experiences: ["Experiências da clínica", "Publicadas, rascunhos e histórico ficarão aqui."],
    team: ["Equipe e permissões", "Administradores, recepção e veterinários serão gerenciados aqui."],
    reports: ["Relatórios da clínica", "Uso por período, tipo e membro da equipe."],
    settings: ["Configurações da clínica", "Logo, cores, assinatura e branding das experiências."],
  }[section] || [title, "Módulo em preparação."];

  return (
    <section className="coming-soon">
      <img
        src="/eterniza/assets/pets/eterniza-pets-institucional.png"
        alt="Eterniza Pets"
      />
      <span>Próxima etapa</span>
      <h2>{content[0]}</h2>
      <p>{content[1]}</p>
      <button className="secondary-action" onClick={onBack}>Voltar ao dashboard</button>
    </section>
  );
}

function Style() {
  return (
    <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
      :root{color-scheme:dark}
      *{box-sizing:border-box}
      body{margin:0;background:#030a10}
      button,a{font:inherit}
      button{cursor:pointer}
      .pets-loading-page{min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 50% 15%,rgba(39,126,212,.18),transparent 32%),#030a10;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;padding:22px}
      .loading-card{width:min(430px,100%);padding:34px;text-align:center;border-radius:24px;border:1px solid rgba(255,255,255,.1);background:#08141e;box-shadow:0 30px 90px rgba(0,0,0,.42)}
      .loading-logo{width:68px;height:68px;display:grid;place-items:center;margin:0 auto 18px;border-radius:20px;background:linear-gradient(135deg,#1d67a8,#75bfff);font-size:30px;color:#04111c}
      .loading-card strong{display:block;font:700 27px Georgia,serif}
      .loading-card span{display:block;color:#9eb4c3;margin-top:8px;line-height:1.45}
      .loading-card button{margin-top:20px;min-height:46px;padding:0 20px;border:0;border-radius:12px;background:#67b9ff;color:#03101a;font-weight:950}
      .error-card .loading-logo{background:rgba(255,78,98,.18);color:#ff9daa}
      .pets-app{--pet-accent:#277ed4;min-height:100vh;display:grid;grid-template-columns:278px minmax(0,1fr);background:radial-gradient(circle at 76% 8%,color-mix(in srgb,var(--pet-accent) 18%,transparent),transparent 26%),linear-gradient(135deg,#030a10,#071723 58%,#03070a);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
      .pets-sidebar{position:sticky;top:0;height:100vh;padding:24px 18px;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08);background:rgba(3,11,17,.92);backdrop-filter:blur(18px);z-index:20}
      .pets-brand{display:flex;align-items:center;gap:12px;padding:8px;text-decoration:none;color:#fff}
      .brand-mark{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;background:color-mix(in srgb,var(--pet-accent) 20%,#081722);border:1px solid color-mix(in srgb,var(--pet-accent) 40%,transparent);overflow:hidden;font-size:25px}
      .brand-mark img{width:100%;height:100%;object-fit:contain;background:#fff}
      .pets-brand strong{display:block;font:700 20px Georgia,serif;max-width:165px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pets-brand small{display:block;color:#7fc7ff;margin-top:4px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}
      .pets-sidebar nav{display:grid;gap:7px;margin-top:31px}
      .pets-sidebar nav button{width:100%;min-height:49px;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;text-align:left;border:1px solid transparent;border-radius:13px;background:transparent;color:#aebfcb;padding:0 12px}
      .pets-sidebar nav button span{font-size:19px;text-align:center}
      .pets-sidebar nav button b{font-size:14px}
      .pets-sidebar nav button em{font-size:9px;font-style:normal;text-transform:uppercase;letter-spacing:.04em;color:#657888}
      .pets-sidebar nav button:hover{background:rgba(255,255,255,.04);color:#fff}
      .pets-sidebar nav button.active{background:color-mix(in srgb,var(--pet-accent) 18%,#0a1822);border-color:color-mix(in srgb,var(--pet-accent) 38%,transparent);color:#fff}
      .sidebar-package{margin-top:auto;padding:17px;border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--pet-accent) 17%,#08131c),#071019);border:1px solid color-mix(in srgb,var(--pet-accent) 28%,transparent)}
      .sidebar-package small,.sidebar-package span{display:block;color:#91a8b8}
      .sidebar-package strong{display:block;margin:7px 0;font:700 18px Georgia,serif}
      .sidebar-package span{font-size:12px}
      .sidebar-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;padding-top:13px;border-top:1px solid rgba(255,255,255,.07)}
      .user-mini{display:flex;align-items:center;gap:9px;min-width:0}
      .user-mini span{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:var(--pet-accent);color:#03101a;font-weight:1000}
      .user-mini div{min-width:0}
      .user-mini strong,.user-mini small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}
      .user-mini strong{font-size:12px}
      .user-mini small{font-size:9px;color:#8093a0;margin-top:3px}
      .sidebar-footer button{border:0;background:transparent;color:#ff9daa;font-size:12px;font-weight:900}
      .pets-workspace{min-width:0;padding:26px 32px 40px}
      .pets-topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1440px;margin:auto}
      .pets-topbar h1{font:700 34px Georgia,serif;margin:4px 0 0}
      .eyebrow{color:#7fc7ff;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}
      .topbar-actions,.welcome-actions{display:flex;gap:10px;flex-wrap:wrap}
      .primary-action,.secondary-action,.text-button{min-height:46px;padding:0 18px;border-radius:12px;font-weight:950}
      .primary-action{border:0;background:linear-gradient(135deg,var(--pet-accent),color-mix(in srgb,var(--pet-accent) 48%,#dff2ff));color:#03101a;box-shadow:0 13px 34px color-mix(in srgb,var(--pet-accent) 24%,transparent)}
      .secondary-action{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:#fff}
      .text-button{border:0;background:transparent;color:#80c8ff;padding:0}
      .mobile-menu{display:none;width:44px;height:44px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.05);color:#fff}
      .dashboard-stack{max-width:1440px;margin:25px auto 0;display:grid;gap:17px}
      .welcome-card{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 370px;align-items:center;gap:20px;padding:32px 34px;border-radius:26px;border:1px solid color-mix(in srgb,var(--pet-accent) 29%,transparent);background:radial-gradient(circle at 82% 12%,color-mix(in srgb,var(--pet-accent) 22%,transparent),transparent 36%),rgba(255,255,255,.035);box-shadow:0 25px 80px rgba(0,0,0,.25)}
      .welcome-card h2{font:700 clamp(34px,4vw,54px)/1 Georgia,serif;margin:11px 0}
      .welcome-card p{color:#aebfca;line-height:1.6;max-width:750px;margin:0}
      .welcome-card p b{color:#fff}
      .welcome-actions{margin-top:23px}
      .welcome-visual{height:220px;display:grid;place-items:center;overflow:hidden}
      .welcome-visual img{width:100%;max-height:240px;object-fit:contain;border-radius:20px;filter:drop-shadow(0 20px 30px rgba(0,0,0,.34))}
      .metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
      .metric-card{display:flex;align-items:center;gap:15px;padding:20px;border-radius:19px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035)}
      .metric-icon{width:48px;height:48px;display:grid;place-items:center;flex:0 0 auto;border-radius:15px;background:color-mix(in srgb,var(--pet-accent) 18%,#08131c);color:#8ccfff;font-size:20px;font-weight:1000}
      .metric-card strong,.metric-card b,.metric-card small{display:block}
      .metric-card strong{font-size:27px}
      .metric-card b{font-size:13px;margin-top:2px}
      .metric-card small{font-size:11px;color:#8296a4;margin-top:4px}
      .dashboard-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:17px}
      .dashboard-grid.lower{grid-template-columns:1.25fr .75fr}
      .panel{padding:23px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.032)}
      .panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}
      .panel-heading h3{font:700 25px Georgia,serif;margin:6px 0 0}
      .panel-heading strong{font-size:23px;color:#85ccff}
      .package-numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:25px}
      .package-numbers div{padding:16px;border-radius:15px;background:rgba(255,255,255,.035)}
      .package-numbers span,.package-numbers strong{display:block}
      .package-numbers span{color:#8fa2af;font-size:11px}
      .package-numbers strong{font-size:25px;margin-top:5px}
      .progress-track{height:12px;margin-top:22px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}
      .progress-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--pet-accent),#86ceff)}
      .package-footer{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:#899da9;font-size:11px}
      .quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
      .quick-action{display:flex;align-items:center;gap:12px;text-align:left;min-height:86px;padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:rgba(255,255,255,.025);color:#fff}
      .quick-action:hover{border-color:color-mix(in srgb,var(--pet-accent) 40%,transparent);background:color-mix(in srgb,var(--pet-accent) 9%,#08141d)}
      .quick-action span{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:color-mix(in srgb,var(--pet-accent) 17%,#08141d);color:#8bd0ff;font-size:20px}
      .quick-action strong,.quick-action small{display:block}
      .quick-action small{color:#8396a4;margin-top:4px;line-height:1.35}
      .recent-list{display:grid;gap:9px;margin-top:18px}
      .recent-row{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;padding:12px;border-radius:14px;background:rgba(255,255,255,.025)}
      .recent-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:rgba(255,255,255,.05)}
      .recent-row strong,.recent-row small{display:block}
      .recent-row small{color:#8295a3;margin-top:3px}
      .recent-row em{font-style:normal;font-size:10px;font-weight:1000;color:#85ccff}
      .empty-state{text-align:center;padding:27px 15px}
      .empty-state span{font-size:38px}
      .empty-state h4{font:700 24px Georgia,serif;margin:10px 0 7px}
      .empty-state p{color:#8fa3b0;max-width:520px;margin:0 auto 18px;line-height:1.5}
      .brand-preview{text-align:center;padding:22px;margin:18px 0;border-radius:18px;background:radial-gradient(circle at 50% 18%,color-mix(in srgb,var(--pet-accent) 15%,transparent),transparent 42%),rgba(255,255,255,.025)}
      .clinic-logo-preview{width:78px;height:78px;display:grid;place-items:center;margin:auto;border-radius:20px;background:#fff;overflow:hidden;font-size:30px}
      .clinic-logo-preview img{width:100%;height:100%;object-fit:contain}
      .brand-preview strong,.brand-preview small{display:block}
      .brand-preview strong{font:700 23px Georgia,serif;margin-top:13px}
      .brand-preview small{color:#8ba0ae;margin-top:5px}
      .brand-partnership{margin-top:18px;padding-top:15px;border-top:1px solid rgba(255,255,255,.08)}
      .brand-partnership span,.brand-partnership b{display:block}
      .brand-partnership span{font-size:10px;color:#78909f;text-transform:uppercase;letter-spacing:.08em}
      .brand-partnership b{margin-top:6px;color:#89ceff}
      .full{width:100%}

      .team-shell{max-width:1440px;margin:25px auto 0}.team-heading{align-items:flex-end}.team-toolbar{display:grid;grid-template-columns:1fr 220px auto;gap:10px;margin-top:20px}.team-toolbar input,.team-toolbar select,.team-form-grid input,.team-form-grid select,.team-form-grid textarea,.team-password-card input{width:100%;min-height:46px;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;border-radius:13px;padding:12px 14px;outline:none}.team-toolbar input:focus,.team-toolbar select:focus,.team-form-grid input:focus,.team-form-grid select:focus,.team-form-grid textarea:focus,.team-password-card input:focus{border-color:var(--pet-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--pet-accent) 14%,transparent)}.team-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:14px}.team-summary div{padding:16px 18px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}.team-summary strong,.team-summary span{display:block}.team-summary strong{font-size:26px}.team-summary span{color:#8297a5;font-size:11px;margin-top:3px}.team-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}.team-card{display:grid;grid-template-columns:58px 1fr;gap:14px;padding:18px;border-radius:19px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.032)}.team-card.inactive{opacity:.67}.team-avatar{width:58px;height:58px;display:grid;place-items:center;border-radius:17px;background:linear-gradient(135deg,var(--pet-accent),#9bd7ff);color:#03101a;font-size:23px;font-weight:1000}.team-card-main{min-width:0}.team-card-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.team-card-title h3{font:700 22px Georgia,serif;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.team-card-title em{padding:5px 8px;border-radius:999px;font-size:9px;font-style:normal;font-weight:1000}.team-card-title em.active{background:rgba(70,220,145,.12);color:#8ff0bd}.team-card-title em.inactive{background:rgba(255,90,110,.12);color:#ffadb7}.team-card-main>strong,.team-card-main>a,.team-card-main>span,.team-card-main>small{display:block}.team-card-main>strong{color:#8bd0ff;margin-top:5px;font-size:12px}.team-card-main>a,.team-card-main>span{color:#a8bac5;text-decoration:none;margin-top:5px;font-size:12px}.team-card-main>small{color:#728894;margin-top:8px}.team-card-actions{grid-column:1/-1;display:flex;gap:7px;justify-content:flex-end;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}.team-card-actions button{min-height:38px;padding:0 12px;border:1px solid rgba(255,255,255,.11);border-radius:10px;background:rgba(255,255,255,.045);color:#fff;font-weight:900}.team-card-actions .danger-mini{color:#ff9ca8}.team-card-actions .success-mini{color:#8ff0bd}.team-card-actions button:disabled{opacity:.35;cursor:not-allowed}.team-modal-overlay{position:fixed;inset:0;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.72);z-index:170;overflow:auto}.team-modal-card{width:min(820px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:26px;border-radius:23px;border:1px solid rgba(255,255,255,.12);background:#0b151e;box-shadow:0 35px 100px rgba(0,0,0,.5)}.team-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.team-modal-head h3{font:700 31px Georgia,serif;margin:6px 0}.team-modal-head>button{width:40px;height:40px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.04);color:#fff;font-size:24px}.team-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.team-form-grid label{display:grid;gap:7px;color:#dce7ed;font-size:12px;font-weight:900}.team-form-grid .team-notes{grid-column:1/-1}.permission-box{margin-top:18px;padding:17px;border-radius:17px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025)}.permission-box>div:first-child strong,.permission-box>div:first-child small{display:block}.permission-box>div:first-child small{color:#8297a5;margin-top:4px}.permission-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.permission-grid label{display:flex;align-items:center;gap:9px;min-height:42px;padding:9px 11px;border-radius:11px;background:rgba(255,255,255,.035);font-size:12px}.permission-grid label.disabled{opacity:.65}.permission-grid input{accent-color:var(--pet-accent)}.team-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.team-password-card{width:min(430px,100%);padding:28px;text-align:center;border-radius:23px;border:1px solid rgba(255,255,255,.12);background:#0b151e}.team-password-card>span{font-size:42px}.team-password-card h3{font:700 29px Georgia,serif;margin:10px 0}.team-password-card p{color:#93a8b5;line-height:1.5}.team-password-card p b{color:#fff}.team-password-card>div{display:flex;justify-content:center;gap:9px;margin-top:15px}

      .settings-shell{max-width:1440px;margin:25px auto 0}.settings-heading{align-items:flex-end}.settings-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;margin-top:20px}.settings-tabs{display:grid;align-content:start;gap:7px;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:19px;background:rgba(255,255,255,.025);height:max-content}.settings-tabs button{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 13px;border:1px solid transparent;border-radius:13px;background:transparent;color:#8fa5b2;text-align:left}.settings-tabs button.active{color:#fff;border-color:color-mix(in srgb,var(--pet-accent) 35%,transparent);background:color-mix(in srgb,var(--pet-accent) 12%,#07131d)}.settings-tabs span{font-size:18px}.settings-content{min-width:0}.settings-card{padding:24px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.032)}.settings-card-head{display:flex;align-items:center;gap:13px;margin-bottom:20px}.settings-card-head>span{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:color-mix(in srgb,var(--pet-accent) 14%,#07131d);font-size:22px}.settings-card-head h3{font:700 27px Georgia,serif;margin:0}.settings-card-head p{color:#879ba8;margin:5px 0 0}.settings-card-head.compact{margin-top:20px}.settings-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.settings-form-grid.single{grid-template-columns:1fr}.settings-form-grid label{display:grid;gap:7px;color:#dce7ed;font-size:12px;font-weight:900}.settings-form-grid input,.settings-form-grid textarea{width:100%;min-height:47px;padding:12px 14px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:#07131d;color:#fff;outline:none}.settings-form-grid input:focus,.settings-form-grid textarea:focus{border-color:var(--pet-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--pet-accent) 14%,transparent)}.settings-form-grid input:disabled,.settings-form-grid textarea:disabled{opacity:.6;cursor:not-allowed}.settings-wide{grid-column:1/-1}.settings-divider{height:1px;background:rgba(255,255,255,.08);margin:25px 0}.branding-settings-grid{display:grid;grid-template-columns:1fr 340px;gap:20px}.color-field{display:grid;grid-template-columns:64px 1fr;gap:8px}.color-field input[type=color]{padding:5px}.settings-brand-preview{display:grid;place-items:center;align-content:center;text-align:center;min-height:370px;padding:24px;border-radius:19px;background:radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--preview-color) 28%,transparent),transparent 43%),#07131d;border:1px solid rgba(255,255,255,.08)}.settings-brand-preview>small{text-transform:uppercase;letter-spacing:.08em;color:#78909f}.settings-preview-logo{width:90px;height:90px;display:grid;place-items:center;margin:20px 0 8px;border-radius:23px;background:#fff;overflow:hidden;font-size:34px}.settings-preview-logo img{width:100%;height:100%;object-fit:contain}.settings-brand-preview h3{font:700 28px Georgia,serif;margin:8px}.settings-brand-preview p{color:#98acb8;line-height:1.5}.settings-brand-preview button{min-height:43px;padding:0 16px;border:0;border-radius:12px;background:var(--preview-color);color:#fff;font-weight:1000}.settings-switches{display:grid;gap:10px}.settings-switches>label{display:flex;align-items:center;gap:13px;padding:16px;border-radius:15px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07)}.settings-switches input{width:20px;height:20px;accent-color:var(--pet-accent)}.settings-switches strong,.settings-switches small{display:block}.settings-switches small{color:#8398a5;margin-top:4px}.settings-preference-fields{margin-top:16px}.password-settings{max-width:560px}.password-settings button{justify-self:start}.plan-settings-hero{display:flex;align-items:flex-start;justify-content:space-between;padding:23px;border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--pet-accent) 16%,#07131d),#07131d)}.plan-settings-hero small,.plan-settings-hero h3,.plan-settings-hero strong{display:block}.plan-settings-hero h3{font:700 31px Georgia,serif;margin:7px 0}.plan-settings-hero strong{font-size:22px;color:#9bd7ff}.plan-settings-hero em{padding:7px 11px;border-radius:999px;background:rgba(70,220,145,.12);color:#8ff0bd;font-style:normal;font-size:11px;font-weight:1000}.plan-settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:14px}.plan-settings-grid div{padding:16px;border-radius:15px;background:rgba(255,255,255,.03)}.plan-settings-grid span,.plan-settings-grid strong{display:block}.plan-settings-grid span{color:#8095a2;font-size:11px}.plan-settings-grid strong{margin-top:6px}.plan-readonly-note{color:#8297a5;margin:18px 0 0}.settings-error{margin:0 0 14px}
      .coming-soon{max-width:820px;margin:60px auto 0;text-align:center;padding:35px;border-radius:26px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035)}
      .coming-soon img{width:min(100%,430px);max-height:250px;object-fit:contain;border-radius:20px}
      .coming-soon span{display:block;color:#78c5ff;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em;margin-top:20px}
      .coming-soon h2{font:700 40px Georgia,serif;margin:9px 0}
      .coming-soon p{color:#91a5b2;line-height:1.5}
      .menu-overlay{display:none}

      .wizard-shell,.experiences-shell{max-width:1440px;margin:25px auto 0}.wizard-head{display:grid;grid-template-columns:1fr 250px;align-items:end;gap:20px;margin-bottom:18px}.wizard-head h2,.section-heading-pet h2{font:700 38px Georgia,serif;margin:5px 0}.wizard-head p,.section-heading-pet p{color:#8fa4b1;margin:0}.wizard-progress{height:10px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}.wizard-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--pet-accent),#8bd0ff)}.type-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.type-card{min-height:180px;text-align:left;padding:23px;border-radius:20px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);color:#fff}.type-card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--pet-accent) 45%,transparent);background:color-mix(in srgb,var(--pet-accent) 9%,#08131c)}.type-card span{display:block;font-size:34px}.type-card strong{display:block;font:700 22px Georgia,serif;margin:13px 0 7px}.type-card small{color:#8fa3b0;line-height:1.4}.wizard-card{padding:25px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.032)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form-grid.one{grid-template-columns:1fr}.story-questions{margin-top:22px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08)}.story-questions-head h3{font:700 27px Georgia,serif;margin:6px 0}.story-questions-head p{color:#8fa3b0;margin:0 0 18px}.story-question{display:grid;gap:10px;margin-top:17px}.story-question strong{font-size:14px}.story-options{display:flex;gap:9px;flex-wrap:wrap}.story-options button{min-height:43px;padding:0 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.035);color:#d8e5ec;font-weight:850}.story-options button.selected{border-color:var(--pet-accent);background:color-mix(in srgb,var(--pet-accent) 16%,#07131d);color:#fff}.story-question input{width:100%;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;border-radius:13px;padding:13px 14px}.music-suggestion{display:block;color:#82a8bf;font-size:11px;font-weight:500;margin-top:4px}.form-grid label{display:grid;gap:7px;color:#dce7ed;font-size:13px;font-weight:900}.field-help{color:#7f95a3;font-size:11px;font-weight:500;line-height:1.4}.form-grid input,.form-grid select,.form-grid textarea{width:100%;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;border-radius:13px;padding:13px 14px;outline:none}.form-grid input:focus,.form-grid select:focus,.form-grid textarea:focus{border-color:var(--pet-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--pet-accent) 14%,transparent)}.form-grid input[type=color]{height:49px;padding:5px}.youtube-search-field{grid-column:1/-1;display:grid;gap:9px}.youtube-search-field label{color:#dce7ed;font-size:13px;font-weight:900}.youtube-search-row{display:grid;grid-template-columns:1fr auto;gap:9px}.youtube-search-row input{width:100%;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;border-radius:13px;padding:13px 14px}.youtube-message{color:#92a8b5}.youtube-results{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;max-height:340px;overflow:auto}.youtube-result{display:grid;grid-template-columns:92px 1fr auto;align-items:center;gap:10px;text-align:left;padding:9px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.03);color:#fff}.youtube-result.selected{border-color:var(--pet-accent);background:color-mix(in srgb,var(--pet-accent) 12%,#07131d)}.youtube-result img{width:92px;height:58px;object-fit:cover;border-radius:9px}.youtube-result span strong,.youtube-result span small{display:block}.youtube-result span small{color:#8399a7;margin-top:4px}.youtube-result b{font-size:11px;color:#8fd0ff}.selected-music{display:flex;justify-content:space-between;align-items:center;padding:11px 13px;border-radius:12px;background:rgba(95,205,255,.09);color:#9bd8ff}.selected-music button{border:0;background:transparent;color:#ff9fa9}.photo-picker{display:grid;place-items:center;text-align:center;min-height:115px;margin-top:18px;border:1px dashed rgba(255,255,255,.2);border-radius:17px;background:rgba(255,255,255,.025)}.photo-picker input{display:none}.photo-picker span{font-weight:1000}.photo-picker small{color:#8498a5;margin-top:6px}.wizard-photos{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}.wizard-photos div{position:relative;height:130px}.wizard-photos img{width:100%;height:100%;object-fit:cover;border-radius:14px}.wizard-photos button{position:absolute;right:6px;top:6px;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.62);color:#fff}.wizard-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.wizard-error{margin-top:15px;padding:13px;border-radius:12px;background:rgba(255,65,85,.11);border:1px solid rgba(255,65,85,.24);color:#ffb5be}.review-grid{display:grid;grid-template-columns:1fr 380px;gap:18px}.review-preview,.review-summary{padding:27px;border-radius:22px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035)}.review-preview{text-align:center;background:radial-gradient(circle at 50% 0%,color-mix(in srgb,var(--preview-accent) 25%,transparent),transparent 38%),rgba(255,255,255,.03)}.review-preview span{font-size:43px}.review-preview small,.review-preview h3,.review-preview b,.review-preview em{display:block}.review-preview h3{font:700 48px Georgia,serif;margin:10px}.review-preview b{color:#9ed6ff}.review-preview img{width:100%;max-height:340px;object-fit:cover;border-radius:19px;margin:20px 0}.review-preview p{white-space:pre-wrap;color:#cad7df;line-height:1.65}.review-preview em{font-style:normal;color:#8ea5b3;margin-top:18px}.preview-button{width:100%;margin-top:20px}.review-summary h3{font:700 30px Georgia,serif;margin:8px 0}.review-summary dl{display:grid;gap:8px}.review-summary dl div{display:flex;justify-content:space-between;gap:15px;padding:12px;border-radius:11px;background:rgba(255,255,255,.035)}.review-summary dt{color:#8297a5}.review-summary dd{margin:0;font-weight:900}.review-summary p{color:#8da2af;line-height:1.5}.section-heading-pet{display:flex;justify-content:space-between;align-items:center;gap:16px}.experience-list{display:grid;gap:11px;margin-top:18px}.experience-card{display:grid;grid-template-columns:90px 1fr auto;align-items:center;gap:16px;padding:14px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.032)}.experience-cover{width:90px;height:82px;display:grid;place-items:center;border-radius:14px;background:color-mix(in srgb,var(--pet-accent) 13%,#08131c);font-size:31px;overflow:hidden}.experience-cover img{width:100%;height:100%;object-fit:cover}.experience-info small{color:#7fc7ff;font-weight:900}.experience-info h3{font:700 23px Georgia,serif;margin:4px 0}.experience-info p{color:#8da2af;margin:0}.experience-status{display:inline-flex;margin-top:7px;padding:5px 8px;border-radius:999px;font-size:9px;font-style:normal;font-weight:1000}.experience-status.published{background:rgba(70,220,145,.12);color:#8ff0bd}.experience-status.draft{background:rgba(255,190,70,.12);color:#ffd185}.experience-status.archived{background:rgba(255,255,255,.08);color:#9aabb6}.experience-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.experience-actions a,.experience-actions button{min-height:39px;padding:0 13px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;text-decoration:none;font-weight:900}.experience-actions .danger-mini{color:#ff9ca8}.experience-empty{text-align:center;padding:55px;border-radius:22px;border:1px dashed rgba(255,255,255,.14);margin-top:18px;color:#8ea3b0}.experience-empty span{font-size:40px}.experience-empty h3{font:700 28px Georgia,serif;color:#fff;margin:10px}.notice-overlay{position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.65);z-index:100;padding:20px}.notice-card{width:min(430px,100%);text-align:center;padding:30px;border-radius:23px;background:#0b151e;border:1px solid rgba(255,255,255,.12)}.notice-card span{width:58px;height:58px;display:grid;place-items:center;margin:auto;border-radius:17px;background:rgba(75,220,145,.15);color:#8ff0bd;font-size:28px}.notice-card h2{font:700 30px Georgia,serif}.notice-card p{color:#93a8b5;line-height:1.5}.notice-card a,.notice-card button{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;border-radius:12px;margin-top:9px;text-decoration:none;font-weight:1000}.notice-card a{background:var(--pet-accent);color:#03101a}.notice-card button{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff}.delete-confirm-overlay{position:fixed;inset:0;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.72);z-index:160}.delete-confirm-card{width:min(460px,100%);padding:29px;text-align:center;border-radius:23px;border:1px solid rgba(255,255,255,.12);background:#0b151e;box-shadow:0 35px 100px rgba(0,0,0,.48)}.delete-confirm-card span{font-size:42px}.delete-confirm-card h3{font:700 30px Georgia,serif;margin:12px 0}.delete-confirm-card p{color:#9aafbb;line-height:1.55}.delete-confirm-card p b{color:#fff}.delete-confirm-card div{display:flex;justify-content:center;gap:10px;margin-top:22px}.delete-confirm-button{min-height:46px;padding:0 17px;border:0;border-radius:12px;background:#d94d61;color:#fff;font-weight:1000}.delete-confirm-button:disabled{opacity:.5}
      @media(max-width:1100px){
        .type-grid{grid-template-columns:repeat(2,1fr)}
        .review-grid{grid-template-columns:1fr}
        .metric-grid{grid-template-columns:repeat(2,1fr)}
        .dashboard-grid,.dashboard-grid.lower{grid-template-columns:1fr}
        .welcome-card{grid-template-columns:1fr}
        .welcome-visual{display:none}
      }
      @media(max-width:820px){
        .pets-app{display:block}
        .pets-sidebar{position:fixed;left:0;top:0;width:278px;transform:translateX(-105%);transition:transform .22s ease}
        .pets-sidebar.open{transform:translateX(0)}
        .menu-overlay{display:block;position:fixed;inset:0;border:0;background:rgba(0,0,0,.56);z-index:15}
        .pets-workspace{padding:20px}
        .mobile-menu{display:grid;place-items:center}
        .pets-topbar{justify-content:flex-start}
        .pets-topbar div:nth-child(2){flex:1}
        .topbar-actions .secondary-action{display:none}
      }
      @media(max-width:560px){
        .wizard-head{grid-template-columns:1fr}
        .type-grid,.form-grid,.youtube-results{grid-template-columns:1fr}
        .youtube-search-row{grid-template-columns:1fr}
        .wizard-photos{grid-template-columns:repeat(2,1fr)}
        .wizard-actions{flex-direction:column}
        .wizard-actions button{width:100%}
        .experience-card{grid-template-columns:72px 1fr}
        .experience-cover{width:72px;height:72px}
        .experience-actions{grid-column:1/-1;justify-content:flex-start}
        .pets-workspace{padding:14px}
        .pets-topbar h1{font-size:26px}
        .topbar-actions .primary-action{padding:0 13px;font-size:12px}
        .welcome-card{padding:24px 20px}
        .welcome-card h2{font-size:36px}
        .welcome-actions{flex-direction:column}
        .welcome-actions button{width:100%}
        .metric-grid{grid-template-columns:1fr}
        .quick-grid{grid-template-columns:1fr}
        .package-numbers{grid-template-columns:1fr}
        .package-footer{display:grid}
      }

      @media(max-width:760px){.settings-layout{grid-template-columns:1fr}.settings-tabs{grid-template-columns:repeat(5,1fr);overflow:auto}.settings-tabs button{justify-content:center;padding:0 10px}.settings-tabs b{display:none}.branding-settings-grid{grid-template-columns:1fr}.settings-form-grid,.plan-settings-grid{grid-template-columns:1fr}.settings-wide{grid-column:auto}.settings-heading{align-items:flex-start;flex-direction:column}.settings-heading button{width:100%}.team-grid{grid-template-columns:1fr}.team-toolbar{grid-template-columns:1fr}.team-summary{grid-template-columns:1fr}.team-form-grid,.permission-grid{grid-template-columns:1fr}.team-form-grid .team-notes{grid-column:auto}.team-card-actions{justify-content:flex-start;flex-wrap:wrap}.team-modal-actions,.team-password-card>div{flex-direction:column}.team-modal-actions button,.team-password-card>div button{width:100%}}
    ` }} />
  );
}
