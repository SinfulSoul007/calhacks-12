import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'THE MIMIC GAME',
  description: '1v1 AI Detection Challenge'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  )
}

