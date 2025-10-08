import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JP7AN Timing System",
  description: "Professional RFID-based timing system for running events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
