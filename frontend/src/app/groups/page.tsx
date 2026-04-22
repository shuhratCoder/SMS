'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Pencil, ChevronLeft, ChevronRight, Users, SlidersHorizontal, Trash2, X, UserPlus, UserCheck, CheckSquare, Square } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { useRouter, useSearchParams } from 'next/navigation'

const ITEMS_PER_PAGE = 6

function GroupsPageInner() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showManageTooltip, setShowManageTooltip] = useState<string | null>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [allContacts, setAllContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal states
  const [manageGroup, setManageGroup] = useState<any | null>(null)
  const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set())
  const [manageSearch, setManageSearch] = useState('')
  const [manageView, setManageView] = useState<'members' | 'others'>('members')
  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<any | null>(null)
  const [deleteGroup, setDeleteGroup] = useState<any | null>(null)
  const [groupNameInput, setGroupNameInput] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const suppressAutoOpenRef = useRef(false)

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([api.getGroups(), api.getContacts()])
      .then(([g, c]) => { setGroups(g); setAllContacts(c) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  // URL helpers
  const clearQuery = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('groupModal')
    url.searchParams.delete('id')
    router.replace(url.pathname, { scroll: false })
  }

  const setQuery = (modal: string, id?: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('groupModal', modal)
    if (id) url.searchParams.set('id', id)
    else url.searchParams.delete('id')
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  // Manage Members
  const openManage = (group: any) => {
    suppressAutoOpenRef.current = false
    setManageGroup(group)
    setManageSearch('')
    setManageView('members')
    const selected = new Set<string>(
      (group.contacts || []).map((c: any) => String(c.id))
    )
    setDraftSelected(selected)
    setQuery('manage', String(group.id))
  }

  const closeManage = () => {
    suppressAutoOpenRef.current = true
    setManageGroup(null)
    setManageSearch('')
    setManageView('members')
    setDraftSelected(new Set())
    clearQuery()
  }

  const toggleDraft = (contactId: string) => {
    setDraftSelected((prev) => {
      const next = new Set(prev)
      if (next.has(contactId)) next.delete(contactId)
      else next.add(contactId)
      return next
    })
  }

  const saveManage = async () => {
    if (!manageGroup) return
    setSaving(true)
    try {
      const currentIds = new Set<string>((manageGroup.contacts || []).map((c: any) => String(c.id)))
      const toAdd = Array.from(draftSelected).filter(id => !currentIds.has(id))
      const toRemove = Array.from(currentIds).filter(id => !draftSelected.has(id))

      if (toAdd.length > 0) {
        const removalsByGroup = new Map<string, string[]>()
        for (const contactId of toAdd) {
          for (const g of groups) {
            if (String(g.id) === String(manageGroup.id)) continue
            const members = (g.contacts || []) as any[]
            if (members.some((m) => String(m.id) === contactId)) {
              const arr = removalsByGroup.get(String(g.id)) || []
              arr.push(contactId)
              removalsByGroup.set(String(g.id), arr)
            }
          }
        }
        for (const [oldGroupId, ids] of Array.from(removalsByGroup.entries())) {
          await api.removeContactsFromGroup(oldGroupId, ids)
        }
        await api.addContactsToGroup(String(manageGroup.id), toAdd)
      }
      if (toRemove.length > 0) {
        await api.removeContactsFromGroup(String(manageGroup.id), toRemove)
      }
      loadData()
      closeManage()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Create/Edit
  const openCreate = () => {
    suppressAutoOpenRef.current = false
    setGroupNameInput('')
    setCreateOpen(true)
    setQuery('create')
  }

  const openEditGroup = (group: any) => {
    suppressAutoOpenRef.current = false
    setEditGroup(group)
    setGroupNameInput(group.groupName)
    setQuery('edit', String(group.id))
  }

  const closeCreateEdit = () => {
    suppressAutoOpenRef.current = true
    setCreateOpen(false)
    setEditGroup(null)
    setGroupNameInput('')
    clearQuery()
  }

  const saveCreateEdit = async () => {
    if (!groupNameInput.trim()) return
    setSaving(true)
    try {
      if (editGroup) {
        await api.updateGroup(String(editGroup.id), { groupName: groupNameInput.trim() })
      } else {
        await api.createGroup({ groupName: groupNameInput.trim() })
      }
      loadData()
      closeCreateEdit()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDeleteGroup = async () => {
    if (!deleteGroup) return
    setSaving(true)
    try {
      await api.deleteGroup(String(deleteGroup.id))
      loadData()
      setDeleteGroup(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Auto-open via URL
  useEffect(() => {
    const modal = searchParams.get('groupModal')
    const id = searchParams.get('id')
    if (suppressAutoOpenRef.current) {
      if (!modal) suppressAutoOpenRef.current = false
      return
    }
    if (modal === 'create') {
      if (!createOpen) openCreate()
    } else if (modal === 'edit' && id) {
      if (!editGroup) {
        const g = groups.find((g: any) => String(g.id) === id)
        if (g) openEditGroup(g)
      }
    } else if (modal === 'manage' && id) {
      if (!manageGroup) {
        const g = groups.find((g: any) => String(g.id) === id)
        if (g) openManage(g)
      }
    } else {
      if (createOpen) setCreateOpen(false)
      if (editGroup) setEditGroup(null)
      if (manageGroup) closeManage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, groups])

  const filtered = groups.filter((g) =>
    (g.groupName || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
console.log("groups",groups)
  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        {t('groups.title')}
      </motion.h1>

      {/* Search + Create */}
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
            placeholder={t('groups.search.placeholder')}
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
          {t('groups.button.create')}
        </button>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-5 text-white/70">
          {t('groups.loading')}
        </div>
      ) : error && groups.length === 0 ? (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-400/30 p-5 text-rose-200">
          {error}
        </div>
      ) : (
        <GlassCard delay={0.2} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">{t('groups.table.title')}</h2>
            <div className="flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {filtered.length} {t('groups.table.count')}
            </div>
          </div>

          <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr] gap-4 px-5 py-3 text-xs text-white/40 border-b border-white/[0.04]">
            <div className="flex items-center gap-1">{t('groups.table.groupName')}</div>
            <div>{t('groups.table.members')}</div>
            <div>{t('groups.table.lastUsed')}</div>
            <div>{t('groups.table.actions')}</div>
          </div>

          <div>
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-white/30 text-sm">
                {t('groups.table.empty')}
              </div>
            ) : (
              paginated.map((group) => (
                <div
                  key={group.id}
                  className="relative grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr] gap-4 px-5 py-3.5 items-center border-b border-white/[0.03] table-row-hover last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${group.color || 'from-indigo-500 to-purple-500'} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {group.initial || (group.groupName || 'G').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/85 font-medium">{group.groupName}</span>
                  </div>

                  <div className="text-sm text-white/70">{(group.contacts || []).length}</div>
                  <div className="text-sm text-white/50">
                    {group.updatedAt
                      ? new Date(group.updatedAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>

                  <div className="relative flex items-center gap-2">
                    <button
                      onMouseEnter={() => setShowManageTooltip(String(group.id))}
                      onMouseLeave={() => setShowManageTooltip(null)}
                      onClick={() => openManage(group)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-purple-300 bg-purple-500/15 border border-purple-500/25 hover:bg-purple-500/25 transition-all"
                    >
                      <Users className="w-3 h-3" />
                      {t('groups.button.manage')}
                    </button>

                    <AnimatePresence>
                      {showManageTooltip === String(group.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1.5 z-50 px-3 py-2 rounded-xl bg-bg-secondary/95 backdrop-blur-xl border border-white/10 shadow-glass text-xs text-white/80 whitespace-nowrap"
                        >
                          {t('groups.manage.tooltip')}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => openEditGroup(group)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      {t('common.edit')}
                    </button>

                    <button
                      onClick={() => setDeleteGroup(group)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t('groups.button.delete')}
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

      {/* Manage Members Modal */}
      <AnimatePresence>
        {manageGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeManage} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-2xl rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-sm text-white/40">{t('groups.manage.modal.title')}</div>
                  <div className="text-lg font-semibold text-white">{manageGroup.groupName}</div>
                </div>
                <button
                  onClick={closeManage}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const originalMemberIds = new Set<string>(
                  (manageGroup.contacts || []).map((c: any) => String(c.id))
                )
                const sourceList =
                  manageView === 'members'
                    ? allContacts.filter((c) => originalMemberIds.has(String(c.id)))
                    : allContacts.filter((c) => !originalMemberIds.has(String(c.id)))
                const visibleList = sourceList.filter((c) =>
                  (c.fullName || '').toLowerCase().includes(manageSearch.trim().toLowerCase())
                )
                const visibleIds = visibleList.map((c) => String(c.id))
                const allVisibleChecked =
                  visibleIds.length > 0 && visibleIds.every((id) => draftSelected.has(id))

                const toggleAllVisible = () => {
                  setDraftSelected((prev) => {
                    const next = new Set(prev)
                    if (allVisibleChecked) {
                      visibleIds.forEach((id) => next.delete(id))
                    } else {
                      visibleIds.forEach((id) => next.add(id))
                    }
                    return next
                  })
                }

                return (
                  <>
                    <div className="px-5 py-4 border-b border-white/[0.06] space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-purple-500/40 focus-within:bg-white/[0.07] transition-all">
                          <Search className="w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            placeholder={t('groups.manage.search.placeholder')}
                            value={manageSearch}
                            onChange={(e) => setManageSearch(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setManageView((v) => (v === 'members' ? 'others' : 'members'))
                            setManageSearch('')
                          }}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs text-purple-300 bg-purple-500/15 border border-purple-500/25 hover:bg-purple-500/25 transition-all whitespace-nowrap"
                        >
                          {manageView === 'members' ? (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              {t('groups.manage.button.addOthers')}
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              {t('groups.manage.button.viewMembers')}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={toggleAllVisible}
                          disabled={visibleIds.length === 0}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-40 transition-all"
                        >
                          {allVisibleChecked ? (
                            <>
                              <Square className="w-3.5 h-3.5" />
                              {t('groups.manage.button.deselectAll')}
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" />
                              {t('groups.manage.button.selectAll')}
                            </>
                          )}
                        </button>
                        <div className="text-xs text-white/35">
                          {manageView === 'members' ? t('groups.manage.members.label') : t('groups.manage.button.addOthers')}: <span className="text-white/70 font-medium">{visibleList.length}</span>
                          <span className="mx-2">•</span>
                          {t('groups.manage.selected.label')}: <span className="text-white/70 font-medium">{draftSelected.size}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/35">
                        {manageView === 'members'
                          ? t('groups.manage.help.removeText')
                          : t('groups.manage.help.addText')}
                      </div>
                    </div>

                    <div className="max-h-[55vh] overflow-y-auto px-5 py-2">
                      {visibleList.map((c) => {
                        const checked = draftSelected.has(String(c.id))
                        return (
                          <label
                            key={c.id}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.06]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleDraft(String(c.id))}
                                className="h-4 w-4 accent-purple-500"
                              />
                              <div className="min-w-0">
                                <div className="text-sm text-white/85 truncate">{c.fullName}</div>
                                <div className="text-xs text-white/35 truncate">
                                  {c.phoneNumber} {c.position ? `• ${c.position}` : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-white/35 whitespace-nowrap">
                              {checked ? t('groups.manage.status.inGroup') : t('groups.manage.status.notInGroup')}
                            </div>
                          </label>
                        )
                      })}
                      {visibleList.length === 0 && (
                        <div className="px-3 py-6 text-sm text-white/35">{t('groups.manage.empty')}</div>
                      )}
                    </div>
                  </>
                )
              })()}

              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={closeManage}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveManage}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all disabled:opacity-50"
                >
                  {saving ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Group Modal */}
      <AnimatePresence>
        {(createOpen || editGroup) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCreateEdit} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="text-lg font-semibold text-white">
                  {editGroup ? t('groups.edit.modal.title') : t('groups.create.modal.title')}
                </div>
                <button
                  onClick={closeCreateEdit}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <label className="block text-sm text-white/70">{t('groups.form.groupName')}</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder={t('groups.form.groupNamePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                />
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={closeCreateEdit}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveCreateEdit}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all disabled:opacity-50"
                >
                  {saving ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Group Confirm */}
      <AnimatePresence>
        {deleteGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteGroup(null)} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/[0.06] text-lg font-semibold text-white">{t('groups.delete.modal.title')}</div>
              <div className="px-5 py-4 text-sm text-white/70">
                {t('groups.delete.confirm', { name: deleteGroup.groupName })}
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteGroup(null)}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 border border-pink-500/30 hover:shadow-glow-purple transition-all disabled:opacity-50"
                >
                  {saving ? t('common.deleting') : t('common.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GroupsPage() {
  return (
    <Suspense fallback={null}>
      <GroupsPageInner />
    </Suspense>
  )
}
