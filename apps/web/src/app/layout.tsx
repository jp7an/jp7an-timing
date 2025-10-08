import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JP7AN Timing',
  description: 'Timing application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
