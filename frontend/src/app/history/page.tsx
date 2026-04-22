'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight,
  SlidersHorizontal, Download, ArrowLeft,
  MessageSquare, Users, Clock
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from "@/lib/api"
import { cn, getInitials } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

const statusConfig: Record<string, { labelKey: string; className: string; icon: string }> = {
  sent:      { labelKey: 'history.filter.sent',      className: 'badge-sent',      icon: '✓' },
  delivered: { labelKey: 'history.filter.delivered', className: 'badge-delivered', icon: '✓✓' },
  failed:    { labelKey: 'history.filter.failed',    className: 'badge-failed',    icon: '✗' },
  pending:   { labelKey: 'history.filter.pending',   className: 'badge-pending',   icon: '⏳' },
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
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [smsHistory, setSmsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSms, setSelectedSms] = useState<any | null>(null)

  useEffect(() => {
    if (!selectedSms) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedSms(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedSms])

  useEffect(() => {
    setLoading(true)
    api.getSmsHistory()
      .then(setSmsHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = smsHistory
    .filter((s) => {
      const recipient = getRecipient(s)
      const matchSearch =
        recipient.toLowerCase().includes(search.toLowerCase()) ||
        (s.message || '').toLowerCase().includes(search.toLowerCase())
      const effectiveStatus = s.status || 'sent'
      const matchStatus = filterStatus === 'all' || effectiveStatus === filterStatus
      return matchSearch && matchStatus
    })
    .slice()
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
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
        {t('history.title')}
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
            placeholder={t('history.search.placeholder')}
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
            {t(`history.filter.${s}`)}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <GlassCard delay={0.2} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">{t('history.table.title')}</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {filtered.length} {t('history.table.count')}
            </div>
            <button
              onClick={() => exportToCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              {t('history.button.export')}
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
          <div style={{ width: '50%' }} className="pr-2">{t('history.table.recipient')}</div>
          <div className="flex items-center gap-2" style={{ width: '50%' }}>
            <div style={{ width: '50%' }}>{t('history.table.messageSummary')}</div>
            <div style={{ width: '20%' }}>{t('history.table.status')}</div>
            <div style={{ width: '30%' }}>{t('history.table.sentAt')}</div>
          </div>
        </div>

        {/* Rows */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-white/30 text-sm">
              {t('common.loading')}
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">
              {t('history.table.empty')}
            </div>
          ) : (
            paginated.map((sms, i) => {
              const recipient = getRecipient(sms)
              const status = statusConfig[sms.status] || statusConfig.sent
              return (
                <div
                  key={sms.id}
                  onClick={() => setSelectedSms(sms)}
                  className="flex items-center px-5 py-3.5 border-b border-white/[0.03] table-row-hover last:border-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 pr-2 min-w-0" style={{ width: '50%' }}>
                    <div className={cn(
                      'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0',
                      avatarColors[i % avatarColors.length]
                    )}>
                      {getInitials(recipient)}
                    </div>
                    <span className="text-sm text-white/85 truncate font-medium">{recipient}</span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0" style={{ width: '50%' }}>
                    <span className="block text-sm text-white/50 truncate min-w-0" style={{ width: '50%' }}>{sms.message}</span>

                    <div style={{ width: '20%' }}>
                      <span className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 w-fit',
                        status.className
                      )}>
                        <span>{status.icon}</span>
                        {t(status.labelKey)}
                      </span>
                    </div>

                    <span className="block text-sm text-white/45 truncate min-w-0" style={{ width: '30%' }}>
                      {sms.createdAt ? formatTime(sms.createdAt) : '—'}
                    </span>
                  </div>
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
            {t('common.previous')}
          </button>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            {t('common.next')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>

      {/* SMS Details Modal */}
      <AnimatePresence>
        {selectedSms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSms(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-lg rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <button
                  onClick={() => setSelectedSms(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/90 hover:border-purple-500/30 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('history.modal.back')}
                </button>
                <div className="text-sm font-semibold text-white/80">
                  {t('history.modal.messageDetails')}
                </div>
                <div className="w-[76px]" />
              </div>

              {/* Body */}
              <div className="px-5 py-5 space-y-4">
                {/* Message */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wide mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t('history.detail.message')}
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedSms.message || '—'}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wide mb-2">
                    <Users className="w-3.5 h-3.5" />
                    {t('history.detail.recipients')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ...(selectedSms.contacts?.map((c: any) => ({ type: 'contact', name: c.fullName })) || []),
                      ...(selectedSms.groups?.map((g: any) => ({ type: 'group', name: g.groupName })) || []),
                    ].length === 0 ? (
                      <span className="text-sm text-white/40">{t('history.detail.noRecipients')}</span>
                    ) : (
                      <>
                        {selectedSms.contacts?.map((c: any, i: number) => (
                          <span
                            key={`c-${i}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 border border-purple-500/25 text-purple-200"
                          >
                            <span className={cn(
                              'w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-[8px] font-bold text-white',
                              avatarColors[i % avatarColors.length]
                            )}>
                              {getInitials(c.fullName)}
                            </span>
                            {c.fullName}
                          </span>
                        ))}
                        {selectedSms.groups?.map((g: any, i: number) => (
                          <span
                            key={`g-${i}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/25 text-blue-200"
                          >
                            <Users className="w-3 h-3" />
                            {g.groupName}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Status & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-2">
                      {t('history.detail.status')}
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      {(() => {
                        const status = statusConfig[selectedSms.status] || statusConfig.sent
                        return (
                          <span className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1',
                            status.className
                          )}>
                            <span>{status.icon}</span>
                            {t(status.labelKey)}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wide mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {t('history.detail.sentAt')}
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80">
                      {selectedSms.createdAt ? formatTime(selectedSms.createdAt) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
