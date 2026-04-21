'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UsersRound, Send, MessageSquare,
  Heart, ArrowRight, ChevronRight,
  Activity, UserPlus
} from 'lucide-react'
import { GlassCard, StatCard } from '@/components/ui/GlassCard'
import { SmsOverviewChart, DeliveryPieChart, OverviewChartPoint } from '@/components/charts/SmsCharts'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusColors = {
  sent: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function recipientCount(sms: any): number {
  const direct = (sms.contacts || []).length
  const viaGroups = (sms.groups || []).reduce(
    (sum: number, g: any) => sum + ((g.contacts || []).length || 0),
    0
  )
  const total = direct + viaGroups
  return total || (sms.groups?.length || 0) || 1
}

function smsStatus(sms: any): 'sent' | 'failed' | 'pending' {
  const s = String(sms.status || '').toLowerCase()
  if (s === 'failed' || s === 'pending' || s === 'sent') return s as any
  return 'sent'
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year}, ${hh}:${mm}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [contactsCount, setContactsCount] = useState<number>(0)
  const [groupsCount, setGroupsCount] = useState<number>(0)
  const [smsHistoryAll, setSmsHistoryAll] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoadingStats(true)
    setStatsError('')

    Promise.all([api.getContacts(), api.getGroups(), api.getSmsHistory()])
      .then(([contacts, groups, smsHistory]) => {
        if (!isMounted) return
        setContactsCount(Array.isArray(contacts) ? contacts.length : 0)
        setGroupsCount(Array.isArray(groups) ? groups.length : 0)
        setSmsHistoryAll(Array.isArray(smsHistory) ? smsHistory : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setStatsError(err instanceof Error ? err.message : 'Failed to load stats')
      })
      .finally(() => {
        if (!isMounted) return
        setLoadingStats(false)
      })

    return () => { isMounted = false }
  }, [])

  // Today / month counts computed locally from the single history fetch
  const smsHistoryToday = useMemo(() => {
    const today = startOfDay(new Date()).getTime()
    return smsHistoryAll.filter((s) => {
      if (!s.createdAt) return false
      return startOfDay(new Date(s.createdAt)).getTime() === today
    }).length
  }, [smsHistoryAll])

  const smsHistoryMonth = useMemo(() => {
    const now = new Date()
    const m = now.getMonth()
    const y = now.getFullYear()
    return smsHistoryAll.filter((s) => {
      if (!s.createdAt) return false
      const d = new Date(s.createdAt)
      return d.getMonth() === m && d.getFullYear() === y
    }).length
  }, [smsHistoryAll])

  // Chart: last 7 distinct days that actually have SMS activity
  const overviewData: OverviewChartPoint[] = useMemo(() => {
    const byDay = new Map<number, { sent: number; failed: number }>()
    for (const sms of smsHistoryAll) {
      if (!sms.createdAt) continue
      const key = startOfDay(new Date(sms.createdAt)).getTime()
      const bucket = byDay.get(key) || { sent: 0, failed: 0 }
      if (smsStatus(sms) === 'failed') bucket.failed += 1
      else bucket.sent += 1
      byDay.set(key, bucket)
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(-7)
      .map(([ts, v]) => {
        const d = new Date(ts)
        const label = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
        return { day: label, sent: v.sent, failed: v.failed }
      })
  }, [smsHistoryAll])

  // Delivery rate (real)
  const deliveryRate = useMemo(() => {
    if (smsHistoryAll.length === 0) return 0
    const sent = smsHistoryAll.filter((s) => smsStatus(s) === 'sent').length
    return Math.round((sent / smsHistoryAll.length) * 1000) / 10
  }, [smsHistoryAll])

  const failedRate = useMemo(() => {
    if (smsHistoryAll.length === 0) return 0
    return Math.round((100 - deliveryRate) * 10) / 10
  }, [deliveryRate, smsHistoryAll.length])

  // Top groups by SMS count
  const topGroupsData = useMemo(() => {
    const counts = new Map<string, { name: string; mentions: number; members: number; lastActivity: string | null }>()
    for (const sms of smsHistoryAll) {
      for (const g of sms.groups || []) {
        const key = String(g.id)
        const prev = counts.get(key) || {
          name: g.groupName,
          mentions: 0,
          members: (g.contacts || []).length,
          lastActivity: null as string | null,
        }
        prev.mentions += 1
        if (!prev.lastActivity || new Date(sms.createdAt) > new Date(prev.lastActivity)) {
          prev.lastActivity = sms.createdAt
        }
        counts.set(key, prev)
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5)
  }, [smsHistoryAll])

  // Recent SMS activity
  const recentActivity = useMemo(() => {
    return [...smsHistoryAll]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        message: s.message,
        recipients: recipientCount(s),
        status: smsStatus(s),
        time: s.createdAt ? formatDateTime(s.createdAt) : '—',
      }))
  }, [smsHistoryAll])

  const stats = [
    {
      title: 'Total Contacts',
      value: loadingStats ? '...' : contactsCount,
      icon: <Users className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/20 to-purple-500/5',
      change: '',
      href: '/contacts',
    },
    {
      title: 'Active Groups',
      value: loadingStats ? '...' : groupsCount,
      icon: <UsersRound className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/20 to-blue-500/5',
      change: '',
      href: '/groups',
    },
    {
      title: 'SMS Sent Today',
      value: loadingStats ? '...' : smsHistoryToday,
      icon: <Send className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      change: '',
      href: '/history',
    },
    {
      title: 'SMS Sent This Month',
      value: loadingStats ? '...' : smsHistoryMonth,
      icon: <MessageSquare className="w-5 h-5 text-pink-400" />,
      gradient: 'from-pink-500/20 to-pink-500/5',
      change: '',
      href: '/history',
    },
    {
      title: 'Delivery Rate',
      value: loadingStats ? '...' : `${deliveryRate}%`,
      icon: <Heart className="w-5 h-5 text-red-400" />,
      gradient: 'from-red-500/20 to-red-500/5',
      change: '',
      href: null as string | null,
    },
  ]

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const card = (
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              change={stat.change || undefined}
              gradient={stat.gradient}
              delay={i * 0.07}
            />
          )
          return stat.href ? (
            <div
              key={stat.title}
              onClick={() => router.push(stat.href!)}
              className="cursor-pointer"
            >
              {card}
            </div>
          ) : (
            <div key={stat.title}>{card}</div>
          )
        })}
      </div>

      {statsError && (
        <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 text-rose-100 p-3 text-sm">
          {statsError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <GlassCard delay={0.3} className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">SMS Overview</h2>
              <p className="text-white/40 text-xs mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white/50">
              <span>
                {overviewData.reduce((s, d) => s + d.sent + d.failed, 0)} SMS
              </span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <SmsOverviewChart data={overviewData} />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Delivery Reports</p>
              <DeliveryPieChart rate={deliveryRate} />
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-white/60">Sent</span>
                  <span className="text-white ml-auto font-medium">{deliveryRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-white/60">Failed</span>
                  <span className="text-white ml-auto font-medium">{failedRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions — corrected links */}
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
            ].map((action) => (
              <Link
                key={action.label}
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
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

          <div className="grid grid-cols-[3fr_1fr_1fr_1.5fr] gap-4 px-3 py-2 text-xs text-white/40 border-b border-white/[0.06]">
            <span>Message</span>
            <span>Recipients</span>
            <span>Status</span>
            <span>Sent At</span>
          </div>

          <div className="space-y-1 mt-1">
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center text-white/30 text-sm">
                {loadingStats ? 'Loading...' : 'No recent SMS'}
              </div>
            ) : (
              recentActivity.map((activity) => {
                const colors = statusColors[activity.status as keyof typeof statusColors] || statusColors.sent
                return (
                  <div
                    key={activity.id}
                    className="grid grid-cols-[3fr_1fr_1fr_1.5fr] gap-4 px-3 py-2.5 rounded-xl table-row-hover items-center"
                  >
                    <span className="text-sm text-white/80 truncate">{activity.message}</span>
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <Users className="w-3 h-3" />
                      <span>{activity.recipients}</span>
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full border capitalize w-fit',
                      colors.bg, colors.text, colors.border
                    )}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                    <span className="text-xs text-white/50 whitespace-nowrap">{activity.time}</span>
                  </div>
                )
              })
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.45} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Top Groups</h2>
            <Link
              href="/groups"> <Users className="w-4 h-4 text-white/30" /> </Link>
          </div>

          <div className="space-y-3">
            {topGroupsData.length === 0 ? (
              <div className="py-6 text-center text-white/30 text-sm">
                {loadingStats ? 'Loading...' : 'No group activity yet'}
              </div>
            ) : (
              topGroupsData.map((group, i) => (
                <div
                  key={group.name + i}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{group.name}</p>
                    <span className="text-xs text-white/30 whitespace-nowrap ml-2">
                      {group.mentions} SMS
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-white/40">{group.members} Members</p>
                    <span className="text-xs text-white/30">
                      {group.lastActivity ? formatDateTime(group.lastActivity) : '—'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </GlassCard>
      </div>
    </div>
  )
}
