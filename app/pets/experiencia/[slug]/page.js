import { prisma } from "../../../../lib/prisma";
import PetExperiencePublicClient from "./PetExperiencePublicClient";

export const dynamic = "force-dynamic";

function titleFor(petName) {
  const name = String(petName || "").trim();
  return name ? `🐾 Uma homenagem para ${name}` : "🐾 Uma homenagem especial para seu melhor amigo";
}

export async function generateMetadata({ params }) {
  const slug = String(params?.slug || "").trim();
  const experience = await prisma.petExperience.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: { petName: true, title: true, photos: true },
  }).catch(() => null);

  const title = titleFor(experience?.petName);
  const description = "Clique para abrir esta homenagem especial preparada com muito carinho. ❤️";
  const image = `/pets/experiencia/${encodeURIComponent(slug)}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: `/pets/experiencia/${slug}` },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Eterniza Pets",
      title,
      description,
      url: `/pets/experiencia/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function PetExperiencePublicPage({ params }) {
  return <PetExperiencePublicClient params={params} />;
}
