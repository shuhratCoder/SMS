'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Send,
  History,
  Settings,
  Bell,
  UserCircle,
  LogOut,
  Box,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/contacts', label: t('nav.contacts'), icon: Users },
    { href: '/groups', label: t('nav.groups'), icon: UsersRound },
    { href: '/send-sms', label: t('nav.sendSms'), icon: Send },
    { href: '/history', label: t('nav.history'), icon: History },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  const bottomItems = [
    { icon: UserCircle, label: t('nav.profile'), key: 'Profile' as const },
    { icon: LogOut, label: t('nav.logout'), key: 'Logout' as const },
  ]

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-full w-[220px] z-40 flex flex-col"
    >
      {/* Фон сайдбара */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-r border-white/[0.06]" />

      {/* Содержимое */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Логотип */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-glow-purple">
              <Box className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">
                SMS B<span className="text-purple-400">roa</span>DCAST
              </span>
            </div>
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'nav-active text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-purple-400' : 'text-white/40'
                    )}
                  />
                  <span>{item.label}</span>

                  {/* Активный индикатор */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-glow-sm"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Нижние иконки */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-4">
            {bottomItems.map(({ icon: Icon, label, key }) => (
              <button
                key={key}
                title={label}
                className="text-white/30 hover:text-white/70 transition-colors"
                onClick={() => {
                  if (key === 'Logout') {
                    sessionStorage.removeItem('token')
                    localStorage.removeItem('token')
                    api.clearCache()
                    router.push('/login')
                  }
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
