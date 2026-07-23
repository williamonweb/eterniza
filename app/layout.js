import SupportWidget from "../components/support/SupportWidget";
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://eternizas.com.br'),
  title: {
    default: 'Eterniza | Onde Cada História Vive Para Sempre',
    template: '%s | Eterniza'
  },
  description: 'Transforme fotos, música e palavras em uma homenagem emocionante e compartilhe um momento inesquecível com quem você ama.',
  applicationName: 'Eterniza',
  authors: [{ name: 'Eterniza' }],
  creator: 'Eterniza',
  publisher: 'Eterniza',
  keywords: ['homenagem online', 'presente digital', 'memórias', 'QR Code', 'homenagem personalizada', 'Eterniza'],
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Eterniza',
    title: 'Eterniza | Onde Cada História Vive Para Sempre',
    description: 'Transforme fotos, música e palavras em uma homenagem emocionante e compartilhe um momento inesquecível com quem você ama.',
    images: [{
      url: '/eterniza/assets/brand/logo-eterniza.png',
      width: 1200,
      height: 630,
      alt: 'Logo Eterniza — onde cada história vive para sempre'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eterniza | Onde Cada História Vive Para Sempre',
    description: 'Transforme fotos, música e palavras em uma homenagem emocionante.',
    images: ['/eterniza/assets/brand/logo-eterniza.png']
  },
  robots: { index: true, follow: true },
  other: { 'theme-color': '#050706' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050706'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ margin: 0, background: '#02070c' }}>{children}<SupportWidget /></body>
    </html>
  );
}
