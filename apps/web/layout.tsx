export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <title>Jp7an-timing</title>
      </head>
      <body className="text-black bg-white">{children}</body>
    </html>
  );
}