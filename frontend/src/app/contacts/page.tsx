'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getInitials } from '@/lib/utils'
import { api } from '@/lib/api'

const ITEMS_PER_PAGE = 8

// Цвета для аватаров
const avatarColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-yellow-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
]

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.getContacts()
      .then((data) => {
        setContacts(data)
      })
      .catch((err) => {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Contacts yuklanmadi')
      })
      .finally(() => setLoading(false))
  }, [])

  // Фильтрация по поиску
const filtered = contacts.filter((c) =>
  (c.fullname || "").toLowerCase().includes(search.toLowerCase()) ||
  (c.phoneNumber || "").includes(search) ||
  (c.position || "").toLowerCase().includes(search.toLowerCase())
)

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      {/* Заголовок + кнопка добавления */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white font-display"
        >
          Contacts
        </motion.h1>
      </div>

      {/* Поиск + кнопка добавления */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        {/* Поисковая строка */}
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm focus-within:border-purple-500/40 focus-within:bg-white/[0.07] transition-all">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
          />
          <SlidersHorizontal className="w-4 h-4 text-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Кнопка добавить */}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 text-white/70">
          Loading contacts...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-400/30 p-5 text-rose-200">
          {error}
        </div>
      ) : (
        <GlassCard delay={0.2} className="overflow-hidden">
        {/* Заголовок таблицы */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Full Name</h2>
          <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            List of 1 ▾
          </div>
        </div>

        {/* Заголовки колонок */}
        <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
          <div className="flex items-center gap-1">Full Name <span className="text-white/20">⚙</span></div>
          <div>Phone Number</div>
          <div>Position</div>
          <div>Actions</div>
        </div>

        {/* Строки */}
        <div>
          {paginated.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
              className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
            >
              {/* Имя + аватар */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {getInitials(contact.fullName)}
                </div>
                <span className="text-sm text-white/85 font-medium">{contact.fullName}</span>
              </div>

              {/* Телефон + флаг */}
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>{contact.flag}</span>
                <span>{contact.phoneNumber}</span>
              </div>

              {/* Должность */}
              <div className="text-sm text-white/65">{contact.position}</div>

              {/* Действия */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/90 transition-all">
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
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
