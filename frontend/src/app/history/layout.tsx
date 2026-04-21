'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { AuthGuard } from '@/components/AuthGuard'

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Sidebar />
        <Header />
        <main className="ml-[220px] pt-16 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
