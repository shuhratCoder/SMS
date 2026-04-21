'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight,
  SlidersHorizontal, Download
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from "@/lib/api"
import { cn, getInitials } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  sent:      { label: 'Sent',      className: 'badge-sent',      icon: '✓' },
  delivered: { label: 'Delivered', className: 'badge-delivered', icon: '✓✓' },
  failed:    { label: 'Failed',    className: 'badge-failed',    icon: '✗' },
  pending:   { label: 'Pending',   className: 'badge-pending',   icon: '⏳' },
}

const avatarColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-yellow-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
]

const ITEMS_PER_PAGE = 6

function formatTime(date: string) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year}, ${hours}:${minutes}`
}

function getRecipient(sms: any) {
  const names = [
    ...(sms.contacts?.map((c: any) => c.fullName) || []),
    ...(sms.groups?.map((g: any) => g.groupName) || [])
  ]
  return names.length ? names.join(', ') : 'No recipient'
}

function exportToCSV(data: any[]) {
  const headers = ['Recipient', 'Message', 'Status', 'Sent At']
  const rows = data.map((sms) => [
    getRecipient(sms),
    `"${(sms.message || '').replace(/"/g, '""')}"`,
    sms.status || 'sent',
    sms.createdAt ? formatTime(sms.createdAt) : '',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sms-history-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [smsHistory, setSmsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getSmsHistory()
      .then(setSmsHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = smsHistory.filter((s) => {
    const recipient = getRecipient(s)
    const matchSearch =
      recipient.toLowerCase().includes(search.toLowerCase()) ||
      (s.message || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        SMS History
      </motion.h1>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm focus-within:border-purple-500/40 focus-within:bg-white/[0.07] transition-all">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by recipient or message..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
          />
          <SlidersHorizontal className="w-4 h-4 text-white/30" />
        </div>
      </motion.div>

      {/* Status filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2"
      >
        {['all', 'sent', 'delivered', 'failed', 'pending'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize',
              filterStatus === s
                ? 'bg-purple-500/25 border border-purple-500/40 text-purple-300'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <GlassCard delay={0.2} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">SMS History</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {filtered.length} messages
            </div>
            <button
              onClick={() => exportToCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Column headers (no Actions) */}
        <div className="grid grid-cols-[2fr_3fr_1.2fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
          <div>Recipient</div>
          <div>Message Summary</div>
          <div>Status</div>
          <div>Sent At</div>
        </div>

        {/* Rows */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-white/30 text-sm">
              Loading...
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">
              No messages found
            </div>
          ) : (
            paginated.map((sms, i) => {
              const recipient = getRecipient(sms)
              const status = statusConfig[sms.status] || statusConfig.sent
              return (
                <div
                  key={sms.id}
                  className="grid grid-cols-[2fr_3fr_1.2fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0',
                      avatarColors[i % avatarColors.length]
                    )}>
                      {getInitials(recipient)}
                    </div>
                    <span className="text-sm text-white/85 truncate font-medium">{recipient}</span>
                  </div>

                  <span className="text-sm text-white/50 truncate">{sms.message}</span>

                  <span className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 w-fit',
                    status.className
                  )}>
                    <span>{status.icon}</span>
                    {status.label}
                  </span>

                  <span className="text-sm text-white/45">{sms.createdAt ? formatTime(sms.createdAt) : '—'}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                  page === p
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
