export const metadata = {
  title: 'Painel CMS',
  manifest: '/admin-manifest.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Eterniza CMS', statusBarStyle: 'black-translucent' },
};

export const viewport = { themeColor: '#0c1110' };

export default function AdminLayout({ children }) {
  return children;
}
