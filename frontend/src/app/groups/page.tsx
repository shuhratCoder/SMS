'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Pencil, ChevronLeft, ChevronRight, Users, SlidersHorizontal } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'

const ITEMS_PER_PAGE = 6

export default function GroupsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showManageTooltip, setShowManageTooltip] = useState<string | null>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.getGroups()
      .then((data) => setGroups(data))
      .catch((err) => {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Groups yuklanmadi')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Groups
      </motion.h1>

      {/* Поиск + создать */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm focus-within:border-purple-500/40 transition-all">
          <Search className="w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
          />
          <SlidersHorizontal className="w-4 h-4 text-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 text-white/70">
          Loading groups...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-400/30 p-5 text-rose-200">
          {error}
        </div>
      ) : (
        <GlassCard delay={0.2} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Groups</h2>
          <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            List of 1 - 6 ▾
          </div>
        </div>

        {/* Заголовки */}
        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
          <div className="flex items-center gap-1">Group Name <span className="text-white/20">⇅</span></div>
          <div>Members</div>
          <div>Last Used</div>
          <div>Actions</div>
        </div>

        {/* Строки */}
        <div>
          {paginated.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="relative grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
            >
              {/* Иконка + название */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${group.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {group.initial}
                </div>
                <span className="text-sm text-white/85 font-medium">{group.groupName}</span>
              </div>

              {/* Количество участников */}
              <div className="text-sm text-white/70">{group.contacts.length}</div>

              {/* Последнее использование */}
              <div className="text-sm text-white/50">{group.lastUsed}</div>

              {/* Кнопки действий */}
              <div className="relative flex items-center gap-2">
                <button
                  onMouseEnter={() => setShowManageTooltip(group.id)}
                  onMouseLeave={() => setShowManageTooltip(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-purple-300 bg-purple-500/15 border border-purple-500/25 hover:bg-purple-500/25 transition-all"
                >
                  <Users className="w-3 h-3" />
                  Manage
                </button>

                {/* Тултип "Manage Members" */}
                <AnimatePresence>
                  {showManageTooltip === group.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 z-50 px-3 py-2 rounded-xl bg-bg-secondary/95 backdrop-blur-xl border border-white/10 shadow-glass text-xs text-white/80 whitespace-nowrap"
                    >
                      Manage Members
                    </motion.div>
                  )}
                </AnimatePresence>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all">
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Пагинация */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  page === p
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>
      )}
    </div>
  )
}
