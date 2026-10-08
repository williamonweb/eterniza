import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { getProjects } from "@/lib/projects";

export const metadata = {
  title: "Projetos — Forge Labs",
  description: "Produtos digitais e experiências criadas pela Forge Labs.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="inner-page">
      <PageHero
        index="02"
        eyebrow="Projetos"
        title="Ideias que saíram"
        highlight=" do papel."
        description="Produtos próprios e trabalhos construídos para negócios reais. Cada case começa por um problema diferente — e termina com uma solução que tem identidade."
      />

      <section className="projects-route-grid">
        {projects.map((project) => (
          <article
            className="project-route-card"
            key={project.slug}
            style={{ "--case-color": project.color } as React.CSSProperties}
          >
            <a className="project-route-preview" href={project.website ?? `/projetos/${project.slug}`} target={project.website ? "_blank" : undefined} rel={project.website ? "noopener noreferrer" : undefined} aria-label={project.website ? `Abrir site oficial de ${project.name}` : `Ver projeto ${project.name}`}>
              {project.image ? (
                <div className="site-browser-frame">
                  <div className="site-browser-bar">
                    <span><i /><i /><i /></span>
                    <small>{project.websiteLabel}</small>
                  </div>
                  <Image
                    src={project.image}
                    alt={`Página inicial do projeto ${project.name}`}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 760px) 90vw, 46vw"
                  />
                </div>
              ) : (
                <div className="project-route-art">
                  <span>{project.name.charAt(0)}</span>
                  <i />
                </div>
              )}
            </a>
            <div className="project-route-meta">
              <span>{project.index}</span>
              <p>{project.category}</p>
            </div>
            <h2>{project.name}</h2>
            <p>{project.summary}</p>
            <div className="project-route-actions">
              <Link href={`/projetos/${project.slug}`}>Ver projeto <ArrowRight /></Link>
              {project.website && (
                <a href={project.website} target="_blank" rel="noreferrer">
                  Abrir site <ExternalLink />
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
