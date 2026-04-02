'use client'

import { motion } from 'framer-motion'
import {
  Users, UsersRound, Send, MessageSquare,
  Heart, ArrowRight, ChevronRight,
  Activity, Zap, UserPlus, RefreshCw
} from 'lucide-react'
import { GlassCard, StatCard } from '@/components/ui/GlassCard'
import { SmsOverviewChart, DeliveryPieChart } from '@/components/charts/SmsCharts'
import { dashboardStats, recentActivities, topGroups } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Статусные цвета для активности
const statusColors = {
  sent: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}

export default function DashboardPage() {
  // Конфигурация карточек статистики
  const stats = [
    {
      title: 'Total Contacts',
      value: dashboardStats.totalContacts,
      icon: <Users className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/20 to-purple-500/5',
      change: '12%',
    },
    {
      title: 'Active Groups',
      value: dashboardStats.activeGroups,
      icon: <UsersRound className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/20 to-blue-500/5',
      change: '3',
    },
    {
      title: 'SMS Sent Today',
      value: dashboardStats.smsSentToday,
      icon: <Send className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      change: '24%',
    },
    {
      title: 'SMS Sent This Month',
      value: dashboardStats.smsSentMonth,
      icon: <MessageSquare className="w-5 h-5 text-pink-400" />,
      gradient: 'from-pink-500/20 to-pink-500/5',
      change: '18%',
    },
    {
      title: 'Delivery Rate',
      value: `${dashboardStats.deliveryRate}%`,
      icon: <Heart className="w-5 h-5 text-red-400" />,
      gradient: 'from-red-500/20 to-red-500/5',
      change: '1.2%',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Dashboard
      </motion.h1>

      {/* Карточки статистики — staggered анимация */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const href =
            stat.title === 'Total Contacts' ? '/contacts' :
            stat.title === 'Active Groups' ? '/groups' :
            stat.title === 'SMS Sent Today' ? '/history' :
            stat.title === 'SMS Sent This Month' ? '/history' :
            stat.title === 'Delivery Rate' ? '/history' :
            '/dashboard'
          return (
            <Link key={stat.title} href={href}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                gradient={stat.gradient}
                delay={i * 0.07}
              />
            </Link>
          )
        })}
      </div>

      {/* Средняя секция: графики + быстрые действия */}
      <div className="grid grid-cols-3 gap-4">
        {/* SMS Overview — занимает 2 колонки */}
        <GlassCard delay={0.3} className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">SMS Overview</h2>
              <p className="text-white/40 text-xs mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white/50">
              <span>1 ST Dtov</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* График баров */}
            <div className="col-span-2">
              <SmsOverviewChart />
            </div>

            {/* Диаграмма доставки */}
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Delivery Reports</p>
              <DeliveryPieChart rate={dashboardStats.deliveryRate} />
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-white/60">Sent</span>
                  <span className="text-white ml-auto font-medium">{dashboardStats.deliveryRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-white/60">Failed</span>
                  <span className="text-white ml-auto font-medium">{(100 - dashboardStats.deliveryRate).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Быстрые действия */}
        <GlassCard delay={0.35} className="p-5">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              {
                label: 'Add Contact',
                icon: <UserPlus className="w-4 h-4" />,
                href: '/contacts?contactModal=create',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                label: 'Create Group',
                icon: <UsersRound className="w-4 h-4" />,
                href: '/groups?groupModal=create',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                label: 'Send SMS',
                icon: <Send className="w-4 h-4" />,
                href: '/send-sms',
                gradient: 'from-blue-500 to-purple-500',
              },
            ].map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <Link
                  href={action.href}
                  className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    bg-gradient-to-r ${action.gradient}
                    text-white font-medium text-sm
                    hover:opacity-90 hover:shadow-glow-purple transition-all duration-200
                  `}
                >
                  {action.icon}
                  {action.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Нижняя секция: активности + топ группы */}
      <div className="grid grid-cols-3 gap-4">
        {/* Последние активности */}
        <GlassCard delay={0.4} className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent SMS Activity</h2>
            <Link
              href="/history"
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Заголовок таблицы */}
          <div className="grid grid-cols-4 gap-4 px-3 py-2 text-xs text-white/40 border-b border-white/[0.06]">
            <span className="col-span-2">Message</span>
            <span>Recipients</span>
            <span>Status</span>
          </div>

          {/* Строки активностей */}
          <div className="space-y-1 mt-1">
            {recentActivities.map((activity, i) => {
              const colors = statusColors[activity.status] || statusColors.sent
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="grid grid-cols-4 gap-4 px-3 py-2.5 rounded-xl table-row-hover items-center"
                >
                  <span className="col-span-2 text-sm text-white/80 truncate">{activity.message}</span>
                  <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <Users className="w-3 h-3" />
                    <span>{activity.recipients}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full border capitalize',
                      colors.bg, colors.text, colors.border
                    )}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                    <span className="text-xs text-white/30 ml-auto">{activity.time}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        {/* Топ группы */}
        <GlassCard delay={0.45} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Top Groups</h2>
            <Users className="w-4 h-4 text-white/30" />
          </div>

          <div className="space-y-3">
            {topGroups.map((group, i) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{group.name}</p>
                  <span className="text-xs text-white/30">{group.mentions} mentions</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-white/40">{group.members} Members</p>
                  <span className="text-xs text-white/30">{group.lastActivity}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Статус системы */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/50">SMS Gateway</span>
              </div>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-white/30" />
                <span className="text-white/50">API Response Time</span>
              </div>
              <span className="text-white/70 font-medium">216 ms</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
