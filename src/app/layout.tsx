import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project-G // Genealogy Research Platform',
  description: 'GPS-compliant genealogical research and proof-argument platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--parchment-dark)' }}>
        {children}
      </body>
    </html>
  )
}
