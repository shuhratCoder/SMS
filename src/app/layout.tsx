import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'SMS Broadcast Admin Panel',
  description: 'Manage your SMS campaigns with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bg-primary min-h-screen overflow-x-hidden">
        {/* Фоновые декоративные элементы */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Основной фон */}
          <div className="absolute inset-0 bg-gradient-main" />

          {/* Декоративные световые пятна */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-pink-600/5 rounded-full blur-[100px]" />

          {/* Световые линии (как на скриншотах) */}
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-20"
            style={{
              background: 'conic-gradient(from 200deg at 100% 100%, transparent 0deg, rgba(124,58,237,0.4) 30deg, rgba(37,99,235,0.3) 60deg, transparent 90deg)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* Контент */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
