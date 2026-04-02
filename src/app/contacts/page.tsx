'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { contacts as mockContacts, groups as mockGroups, type Contact, type Group } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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

function ContactsPageInner() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [groups] = useState<Group[]>(mockGroups)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<Partial<Contact>>({
    name: '',
    phone: '',
    position: '',
    flag: '🏳️',
    country: '',
    group: '',
    status: 'active',
  })

  const clearQuery = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('contactModal')
    url.searchParams.delete('id')
    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
  }

  const openCreate = () => {
    setForm({ name: '', phone: '', position: '', flag: '🏳️', country: '', group: '', status: 'active' })
    setCreateOpen(true)
    const url = new URL(window.location.href)
    url.searchParams.set('contactModal', 'create')
    url.searchParams.delete('id')
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  const openEdit = (c: Contact) => {
    setEditContact(c)
    setForm({ ...c })
    const url = new URL(window.location.href)
    url.searchParams.set('contactModal', 'edit')
    url.searchParams.set('id', c.id)
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  const closeForm = () => {
    setCreateOpen(false)
    setEditContact(null)
    setForm({ name: '', phone: '', position: '', flag: '🏳️', country: '', group: '', status: 'active' })
    clearQuery()
  }

  const saveForm = () => {
    if (!form.name?.trim() || !form.phone?.trim()) return
    if (editContact) {
      setContacts((cs) => cs.map(c => c.id === editContact.id ? { ...(c as Contact), ...(form as Contact) } : c))
      setEditContact(null)
    } else {
      const nowId = String(Date.now())
      const newContact: Contact = {
        id: nowId,
        name: form.name!.trim(),
        phone: form.phone!.trim(),
        flag: form.flag || '🏳️',
        country: form.country || '',
        position: form.position || '',
        group: form.group || '',
        status: (form.status as Contact['status']) || 'active',
      }
      setContacts((cs) => [newContact, ...cs])
      setCreateOpen(false)
    }
    clearQuery()
  }

  // Auto-open modal based on URL tags
  useEffect(() => {
    const modal = searchParams.get('contactModal')
    const id = searchParams.get('id')
    if (modal === 'create') {
      if (!createOpen) openCreate()
    } else if (modal === 'edit' && id) {
      const c = contacts.find(c => c.id === id)
      if (c && !editContact) openEdit(c)
    } else {
      // if params removed externally, ensure modals closed
      if (createOpen || editContact) {
        setCreateOpen(false)
        setEditContact(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, contacts])

  // Фильтрация по поиску
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.position.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <Suspense fallback={null}>
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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </motion.div>

      {/* Таблица контактов */}
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
                  {getInitials(contact.name)}
                </div>
                <span className="text-sm text-white/85 font-medium">{contact.name}</span>
              </div>

              {/* Телефон + флаг */}
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>{contact.flag}</span>
                <span>{contact.phone}</span>
              </div>

              {/* Должность */}
              <div className="text-sm text-white/65">{contact.position}</div>

              {/* Действия */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(contact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/90 transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteContact(contact)}
                  className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                >
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

      {/* Create/Edit modal */}
      {(createOpen || editContact) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-xl rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="text-lg font-semibold text-white">
                {editContact ? 'Edit Contact' : 'Add Contact'}
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/70 mb-1">Full name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone || ''}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Position</label>
                <input
                  type="text"
                  value={form.position || ''}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Manager"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Flag (emoji)</label>
                <input
                  type="text"
                  value={form.flag || ''}
                  onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="🇺🇸"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country || ''}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="USA"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Group</label>
                <select
                  value={form.group || ''}
                  onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                >
                  <option value="">—</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.name} className="text-black bg-white">{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Status</label>
                <select
                  value={form.status || 'active'}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Contact['status'] }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                >
                  <option value="active" className="text-black bg-white">active</option>
                  <option value="inactive" className="text-black bg-white">inactive</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteContact(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] text-lg font-semibold text-white">Delete Contact</div>
            <div className="px-5 py-4 text-sm text-white/70">
              Delete contact “{deleteContact.name}”?
            </div>
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteContact(null)}
                className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContacts((cs) => cs.filter(c => c.id !== deleteContact.id))
                  setDeleteContact(null)
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 border border-pink-500/30 hover:shadow-glow-purple transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Suspense>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsPageInner />
    </Suspense>
  )
}
