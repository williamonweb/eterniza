export const metadata = {
  title: 'Eterniza',
  description: 'Onde Cada História Vive Para Sempre!'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ margin: 0, background: '#02070c' }}>{children}</body>
    </html>
  );
}
