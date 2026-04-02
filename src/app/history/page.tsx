'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  SlidersHorizontal, Download
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { smsHistory } from '@/lib/mock-data'
import { cn, getInitials } from '@/lib/utils'

// Конфиг статусов
const statusConfig: Record<string, { label: string; className: string }> = {
  sent:      { label: 'Sent',      className: 'badge-sent' },
  delivered: { label: 'Delivered', className: 'badge-delivered' },
  failed:    { label: 'Failed',    className: 'badge-failed' },
  pending:   { label: 'Pending',   className: 'badge-pending' },
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

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)

  // Фильтрация по поиску и статусу
  const filtered = smsHistory.filter((s) => {
    const matchSearch =
      s.recipient.toLowerCase().includes(search.toLowerCase()) ||
      s.message.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        SMS History
      </motion.h1>

      {/* Строка поиска + кнопка */}
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
            placeholder="Search messages..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
          />
          <SlidersHorizontal className="w-4 h-4 text-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all">
          <Search className="w-4 h-4" />
          Search messages...
        </button>
      </motion.div>

      {/* Фильтр по статусу */}
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

      {/* Таблица */}
      <GlassCard delay={0.2} className="overflow-hidden">
        {/* Шапка таблицы */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">SMS History</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <span>Sent At</span>
              <ChevronLeft className="w-3 h-3" />
              <ChevronLeft className="w-3 h-3 -ml-2" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80 transition-all">
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Заголовки колонок */}
        <div className="grid grid-cols-[2fr_3fr_1.2fr_1.5fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
          <div>Recipient</div>
          <div>Message Summary</div>
          <div>Status</div>
          <div>Sent At</div>
          <div>Actions</div>
        </div>

        {/* Строки данных */}
        <div>
          {paginated.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">
              No messages found
            </div>
          ) : (
            paginated.map((sms, i) => {
              const status = statusConfig[sms.status] || statusConfig.sent
              return (
                <motion.div
                  key={sms.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="grid grid-cols-[2fr_3fr_1.2fr_1.5fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
                >
                  {/* Получатель */}
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0',
                      avatarColors[i % avatarColors.length]
                    )}>
                      {getInitials(sms.recipient)}
                    </div>
                    <span className="text-sm text-white/85 truncate font-medium">{sms.recipient}</span>
                  </div>

                  {/* Текст сообщения */}
                  <span className="text-sm text-white/50 truncate">{sms.message}</span>

                  {/* Статус */}
                  <span className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 w-fit',
                    status.className
                  )}>
                    <span>✓</span>
                    {status.label}
                  </span>

                  {/* Время */}
                  <span className="text-sm text-white/45">{sms.sentAt}</span>

                </motion.div>
              )
            })
          )}
        </div>

        {/* Пагинация */}
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
