import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

// Layout для всех страниц дашборда (с сайдбаром и хедером)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Боковое меню */}
      <Sidebar />

      {/* Верхняя панель */}
      <Header />

      {/* Основной контент */}
      <main className="ml-[220px] pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
