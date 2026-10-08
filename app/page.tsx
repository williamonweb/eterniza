import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  Box,
  CheckCircle2,
  Code2,
  Layers3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ForgeIntro } from "@/components/forge-intro";
import { processSteps } from "@/lib/site-data";
import { getProjects } from "@/lib/projects";

const capabilities = [
  {
    icon: Code2,
    title: "Sites",
    text: "Experiências autorais, rápidas e prontas para converter.",
    href: "/servicos#sites",
  },
  {
    icon: Blocks,
    title: "Sistemas",
    text: "Operações complexas transformadas em fluxos simples.",
    href: "/servicos#sistemas",
  },
  {
    icon: Zap,
    title: "Automações",
    text: "Integrações que eliminam tarefas manuais e retrabalho.",
    href: "/servicos#automacoes",
  },
  {
    icon: Box,
    title: "Produtos digitais",
    text: "Da ideia ao lançamento, com base pronta para evoluir.",
    href: "/projetos",
  },
];

export default async function Home() {
  const projects = await getProjects();
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const homeProjects = featuredProjects.length ? featuredProjects : projects.slice(0, 3);

  return (
    <main>
      <ForgeIntro />

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow"><span /> Estratégia · Desenvolvimento · Resultados</p>
          <h1>
            Tecnologia forjada para <em>resolver.</em>
          </h1>
          <p className="home-lead">
            Sites, sistemas e automações criados para transformar operações
            reais em experiências digitais fortes, claras e eficientes.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/contato">
              Iniciar um projeto <ArrowRight />
            </Link>
            <Link className="secondary-action" href="/projetos">
              Conhecer projetos <ArrowUpRight />
            </Link>
          </div>

          <div className="hero-proof" aria-label="Diferenciais da Forge Labs">
            <span><CheckCircle2 /> Foco em resultados</span>
            <span><BarChart3 /> Parceria de verdade</span>
            <span><Layers3 /> Tecnologia com propósito</span>
          </div>
        </div>

        <div className="product-stage" aria-label="Exemplo de sistema criado pela Forge Labs">
          <div className="stage-back-card">
            <small>FORGE LABS</small>
            <strong>Soluções de alto impacto para negócios reais.</strong>
            <span>Estratégia · tecnologia · resultados</span>
          </div>

          <div className="dashboard-window">
            <div className="dashboard-topbar">
              <div className="dashboard-dots"><i /><i /><i /></div>
              <span>FORGE <b>LABS</b></span>
              <small>Visão executiva</small>
            </div>
            <div className="dashboard-body">
              <aside>
                <strong>F</strong>
                <Link className="active" href="/">Visão geral</Link>
                <Link href="/projetos">Projetos</Link>
                <Link href="/sobre">Processos</Link>
                <Link href="/servicos">Serviços</Link>
              </aside>
              <div className="dashboard-content">
                <div className="dashboard-heading">
                  <div><small>Painel</small><h2>Visão geral</h2></div>
                  <span>Últimos 30 dias</span>
                </div>
                <div className="metric-grid">
                  <article><small>Projetos ativos</small><strong>12</strong><em>+33%</em></article>
                  <article><small>Processos automatizados</small><strong>28</strong><em>+60%</em></article>
                  <article><small>Tempo economizado</small><strong>320h</strong><em>+48%</em></article>
                </div>
                <div className="chart-panel">
                  <div><small>Evolução dos resultados</small><b>Receita gerada</b></div>
                  <svg viewBox="0 0 560 155" role="img" aria-label="Gráfico crescente de resultados">
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#c9622d" stopOpacity=".34" />
                        <stop offset="1" stopColor="#c9622d" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path className="chart-area" d="M0 132 L50 115 L102 122 L152 91 L205 103 L254 72 L306 79 L357 47 L408 61 L459 42 L510 49 L560 13 L560 155 L0 155 Z" />
                    <path className="chart-line" d="M0 132 L50 115 L102 122 L152 91 L205 103 L254 72 L306 79 L357 47 L408 61 L459 42 L510 49 L560 13" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="stage-metal-card" aria-hidden="true">
            <span>F</span>
          </div>
          <div className="stage-note">Pessoas · processos · tecnologia · resultados</div>
        </div>
      </section>

      <section className="capability-strip" aria-label="Soluções Forge Labs">
        {capabilities.map(({ icon: Icon, title, text, href }) => (
          <Link href={href} key={title}>
            <span><Icon /></span>
            <div><h2>{title}</h2><p>{text}</p></div>
            <ArrowUpRight />
          </Link>
        ))}
      </section>

      <section className="home-projects">
        <div className="section-heading">
          <div>
            <p className="section-kicker"><span /> Nosso trabalho</p>
            <h2>Projetos que já ganharam forma.</h2>
          </div>
          <Link href="/projetos">Ver todos os projetos <ArrowRight /></Link>
        </div>

        <div className="project-showcase">
          {homeProjects.map((project) => {
            return (
              <a
                href={project.website ?? `/projetos/${project.slug}`}
                target={project.website ? "_blank" : undefined}
                rel={project.website ? "noopener noreferrer" : undefined}
                className={`showcase-card showcase-${project.slug}`}
                key={project.slug}
                aria-label={project.website ? `Abrir site oficial de ${project.name}` : `Ver projeto ${project.name}`}
              >
                <div className="showcase-preview">
                  <div className="preview-browser">
                    <div className="preview-browser-bar">
                      <span><i /><i /><i /></span>
                      <small>{project.websiteLabel}</small>
                    </div>
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={`Página inicial de ${project.name}`}
                        width={1600}
                        height={1000}
                        sizes="(max-width: 760px) 90vw, 46vw"
                      />
                    ) : (
                      <div className="preview-content">
                        <b>{project.name}</b>
                        <small>{project.modules.slice(0, 3).join(" · ")}</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="showcase-copy">
                  <span>{project.index}</span>
                  <div><h3>{project.name}</h3><p>{project.summary}</p></div>
                  <ArrowUpRight />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="home-process">
        <div className="process-intro">
          <p className="section-kicker"><span /> Método Forge</p>
          <h2>Da primeira conversa ao produto funcionando.</h2>
          <p>Um processo direto, com decisões claras e evolução visível em cada etapa.</p>
        </div>
        <ol>
          {processSteps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-cta">
        <div>
          <p className="section-kicker"><span /> Sua próxima ideia</p>
          <h2>Vamos construir algo que realmente faça diferença?</h2>
        </div>
        <Link href="/contato">Começar conversa <ArrowUpRight /></Link>
      </section>
    </main>
  );
}
