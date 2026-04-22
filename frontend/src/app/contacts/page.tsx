'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getInitials } from '@/lib/utils'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { useRouter, useSearchParams } from 'next/navigation'

const ITEMS_PER_PAGE = 8

const avatarColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-yellow-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
]

interface ContactForm {
  fullName: string
  phoneNumber: string
  position: string
}

function formatUzPhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  let d = digits
  if (d.startsWith('998')) d = d.slice(3)
  d = d.slice(0, 9)

  let out = '+998'
  if (d.length > 0) out += ' ' + d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}

const PHONE_FULL_LENGTH = '+998 XX XXX XX XX'.length

function ContactsPageInner() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editContact, setEditContact] = useState<any | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteContact, setDeleteContact] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const suppressAutoOpenRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState<ContactForm>({
    fullName: '',
    phoneNumber: '',
    position: '',
  })

  const loadContacts = () => {
    setLoading(true)
    api.getContacts()
      .then(setContacts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContacts()
  }, [])

  // URL params helpers
  const clearQuery = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('contactModal')
    url.searchParams.delete('id')
    router.replace(url.pathname, { scroll: false })
  }

  const openCreate = () => {
    suppressAutoOpenRef.current = false
    setForm({ fullName: '', phoneNumber: '', position: '' })
    setCreateOpen(true)
    const url = new URL(window.location.href)
    url.searchParams.set('contactModal', 'create')
    url.searchParams.delete('id')
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  const openEdit = (c: any) => {
    suppressAutoOpenRef.current = false
    setEditContact(c)
    setForm({
      fullName: c.fullName || '',
      phoneNumber: formatUzPhone(c.phoneNumber || ''),
      position: c.position || '',
    })
    const url = new URL(window.location.href)
    url.searchParams.set('contactModal', 'edit')
    url.searchParams.set('id', c.id)
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  const closeForm = () => {
    suppressAutoOpenRef.current = true
    setCreateOpen(false)
    setEditContact(null)
    setForm({ fullName: '', phoneNumber: '', position: '' })
    clearQuery()
  }

  const saveForm = async () => {
    if (!form.fullName.trim() || !form.phoneNumber.trim()) return
    const phoneDigits = form.phoneNumber.replace(/\D/g, '')
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith('998')) {
      setError('Phone number must be in +998 XX XXX XX XX format')
      return
    }
    setSaving(true)
    try {
      if (editContact) {
        await api.updateContact(editContact.id, {
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          position: form.position.trim(),
        })
      } else {
        await api.createContact({
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          position: form.position.trim(),
        })
      }
      loadContacts()
      closeForm()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteContact) return
    setSaving(true)
    try {
      await api.deleteContact(deleteContact.id)
      loadContacts()
      setDeleteContact(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Auto-open modal based on URL params
  useEffect(() => {
    const modal = searchParams.get('contactModal')
    const id = searchParams.get('id')
    if (suppressAutoOpenRef.current) {
      if (!modal) suppressAutoOpenRef.current = false
      return
    }
    if (modal === 'create') {
      if (!createOpen) openCreate()
    } else if (modal === 'edit' && id) {
      const c = contacts.find((c: any) => c.id === id || String(c.id) === id)
      if (c && !editContact) openEdit(c)
    } else {
      if (createOpen || editContact) {
        setCreateOpen(false)
        setEditContact(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, contacts])

  const filtered = contacts.filter((c) =>
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneNumber || '').includes(search) ||
    (c.position || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white font-display"
        >
          {t('contacts.title')}
        </motion.h1>
      </div>

      {/* Search + Add */}
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
            placeholder={t('contacts.search.placeholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
          />
          <SlidersHorizontal className="w-4 h-4 text-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('contacts.button.add')}
        </button>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 text-white/70">
          {t('contacts.loading')}
        </div>
      ) : error && contacts.length === 0 ? (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-400/30 p-5 text-rose-200">
          {error}
        </div>
      ) : (
        <GlassCard delay={0.2} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">{t('contacts.table.title')}</h2>
            <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {filtered.length} {t('contacts.table.count')}
            </div>
          </div>

          <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
            <div className="flex items-center gap-1">{t('contacts.table.fullName')}</div>
            <div>{t('contacts.table.phoneNumber')}</div>
            <div>{t('contacts.table.position')}</div>
            <div>{t('contacts.table.actions')}</div>
          </div>

          <div>
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-white/30 text-sm">
                {t('contacts.table.empty')}
              </div>
            ) : (
              paginated.map((contact, i) => (
                <div
                  key={contact.id}
                  className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {getInitials(contact.fullName)}
                    </div>
                    <span className="text-sm text-white/85 font-medium">{contact.fullName}</span>
                  </div>

                  <div className="text-sm text-white/70">{contact.phoneNumber}</div>
                  <div className="text-sm text-white/65">{contact.position}</div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(contact)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/90 transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => setDeleteContact(contact)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
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
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.next')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Create/Edit Contact Modal */}
      {(createOpen || editContact) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-xl rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="text-lg font-semibold text-white">
                {editContact ? t('contacts.modal.edit') : t('contacts.modal.add')}
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/70 mb-1">{t('contacts.form.fullName')}</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder={t('contacts.form.fullNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('contacts.form.phone')}</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onFocus={(e) => {
                    if (!e.target.value) setForm((f) => ({ ...f, phoneNumber: '+998 ' }))
                  }}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: formatUzPhone(e.target.value) }))}
                  maxLength={PHONE_FULL_LENGTH}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder={t('contacts.form.phonePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">{t('contacts.form.position')}</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder={t('contacts.form.positionPlaceholder')}
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all disabled:opacity-50"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteContact(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] text-lg font-semibold text-white">{t('contacts.modal.deleteTitle')}</div>
            <div className="px-5 py-4 text-sm text-white/70">
              {t('contacts.modal.deleteConfirm', { name: deleteContact.fullName })}
            </div>
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteContact(null)}
                className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 border border-pink-500/30 hover:shadow-glow-purple transition-all disabled:opacity-50"
              >
                {saving ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsPageInner />
    </Suspense>
  )
}
