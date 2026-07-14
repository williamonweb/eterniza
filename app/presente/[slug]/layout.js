export const metadata = {
  title: "Você recebeu uma homenagem especial | Eterniza",
  description:
    "Abra uma homenagem criada com carinho. Onde cada história vive para sempre.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Eterniza",
    title: "Você recebeu uma homenagem especial | Eterniza",
    description:
      "Abra uma homenagem criada com carinho. Onde cada história vive para sempre.",
    images: [
      {
        url: "/eterniza/assets/brand/logo-eterniza.png",
        alt: "Logo Eterniza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Você recebeu uma homenagem especial | Eterniza",
    description:
      "Abra uma homenagem criada com carinho. Onde cada história vive para sempre.",
    images: ["/eterniza/assets/brand/logo-eterniza.png"],
  },
};

export default function PresenteLayout({ children }) {
  return children;
}
