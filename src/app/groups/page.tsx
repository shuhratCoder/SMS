'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Pencil, ChevronLeft, ChevronRight, Users, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { contacts as mockContacts, groups as mockGroups, type Contact, type Group } from '@/lib/mock-data'
import { useRouter, useSearchParams } from 'next/navigation'

const ITEMS_PER_PAGE = 6

function GroupsPageInner() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showManageTooltip, setShowManageTooltip] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>(mockGroups)
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [manageGroup, setManageGroup] = useState<Group | null>(null)
  const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set())
  const [manageSearch, setManageSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null)
  const [groupNameInput, setGroupNameInput] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const suppressAutoOpenRef = useRef(false)

  // Auto-open via URL
  useEffect(() => {
    const modal = searchParams.get('groupModal')
    const id = searchParams.get('id')
    if (suppressAutoOpenRef.current) {
      // Ждём, пока параметры очистятся, затем разрешаем авто-открытие снова
      if (!modal) suppressAutoOpenRef.current = false
      return
    }
    if (modal === 'create') {
      if (!createOpen) { setGroupNameInput(''); setCreateOpen(true) }
    } else if (modal === 'edit' && id) {
      if (!editGroup) {
        const g = groups.find(g => g.id === id)
        if (g) { setEditGroup(g); setGroupNameInput(g.name) }
      }
    } else if (modal === 'manage' && id) {
      if (!manageGroup) {
        const g = groups.find(g => g.id === id)
        if (g) openManage(g)
      }
    } else {
      // if params cleared
      if (createOpen) setCreateOpen(false)
      if (editGroup) setEditGroup(null)
      if (manageGroup) closeManage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, groups, contacts])

  const openManage = (group: Group) => {
    suppressAutoOpenRef.current = false
    setManageGroup(group)
    setManageSearch('')
    const selected = new Set(
      contacts.filter((c) => c.group === group.name).map((c) => c.id)
    )
    setDraftSelected(selected)
    const url = new URL(window.location.href)
    url.searchParams.set('groupModal', 'manage')
    url.searchParams.set('id', group.id)
    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
  }

  const closeManage = () => {
    suppressAutoOpenRef.current = true
    setManageGroup(null)
    setManageSearch('')
    setDraftSelected(new Set())
    const url = new URL(window.location.href)
    url.searchParams.delete('groupModal')
    url.searchParams.delete('id')
    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
  }

  const toggleDraft = (contactId: string) => {
    setDraftSelected((prev) => {
      const next = new Set(prev)
      if (next.has(contactId)) next.delete(contactId)
      else next.add(contactId)
      return next
    })
  }

  const saveManage = () => {
    suppressAutoOpenRef.current = true
    if (!manageGroup) return
    const groupName = manageGroup.name
    const selectedIds = draftSelected
    setContacts((prev) =>
      prev.map((c) => {
        const inThisGroup = c.group === groupName
        const shouldBeInThisGroup = selectedIds.has(c.id)
        if (shouldBeInThisGroup) return { ...c, group: groupName }
        if (inThisGroup && !shouldBeInThisGroup) return { ...c, group: '' }
        return c
      })
    )
    closeManage()
  }

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
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

        <div className="flex justify-end">
        <button
          onClick={() => {
            suppressAutoOpenRef.current = false
            setCreateOpen(true); setGroupNameInput('')
            const url = new URL(window.location.href)
            url.searchParams.set('groupModal', 'create')
            url.searchParams.delete('id')
            router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      </motion.div>

      {/* Таблица групп */}
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
                <span className="text-sm text-white/85 font-medium">{group.name}</span>
              </div>

              {/* Количество участников */}
              <div className="text-sm text-white/70">
                {contacts.filter((c) => c.group === group.name).length}
              </div>

              {/* Последнее использование */}
              <div className="text-sm text-white/50">{group.lastUsed}</div>

              {/* Кнопки действий */}
              <div className="relative flex items-center gap-2">
                <button
                  onMouseEnter={() => setShowManageTooltip(group.id)}
                  onMouseLeave={() => setShowManageTooltip(null)}
                  onClick={() => openManage(group)}
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

                <button
                  onClick={() => {
                    suppressAutoOpenRef.current = false
                    setEditGroup(group); setGroupNameInput(group.name)
                    const url = new URL(window.location.href)
                    url.searchParams.set('groupModal', 'edit')
                    url.searchParams.set('id', group.id)
                    router.replace(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>

                <button
                  onClick={() => setDeleteGroup(group)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
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

      {/* Create Group Modal trigger */}
      {/* <div className="flex justify-end">
        <button
          onClick={() => { setCreateOpen(true); setGroupNameInput('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 text-white text-sm font-medium hover:shadow-glow-purple hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div> */}

      {/* Manage Members Modal */}
      <AnimatePresence>
        {manageGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeManage}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-2xl rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Manage group members"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-sm text-white/40">Manage Members</div>
                  <div className="text-lg font-semibold text-white">
                    {manageGroup.name}
                  </div>
                </div>

                <button
                  onClick={closeManage}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search + meta */}
              <div className="px-5 py-4 border-b border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-purple-500/40 focus-within:bg-white/[0.07] transition-all">
                  <Search className="w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
                  />
                  <div className="text-xs text-white/35">
                    Selected: <span className="text-white/70 font-medium">{draftSelected.size}</span>
                  </div>
                </div>

                <div className="text-xs text-white/35">
                  Checked contacts will be added to this group. Unchecked contacts will be removed from this group.
                </div>
              </div>

              {/* List */}
              <div className="max-h-[55vh] overflow-y-auto px-5 py-2">
                {contacts
                  .filter((c) => c.name.toLowerCase().includes(manageSearch.trim().toLowerCase()))
                  .map((c) => {
                    const checked = draftSelected.has(c.id)
                    const isInAnotherGroup = c.group && c.group !== manageGroup.name
                    return (
                      <label
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.06]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDraft(c.id)}
                            className="h-4 w-4 accent-purple-500"
                          />
                          <div className="min-w-0">
                            <div className="text-sm text-white/85 truncate">
                              {c.flag} {c.name}
                            </div>
                            <div className="text-xs text-white/35 truncate">
                              {c.phone} • {c.position}
                              {isInAnotherGroup ? ` • currently in: ${c.group}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-white/35 whitespace-nowrap">
                          {checked ? 'Will be in group' : (c.group === manageGroup.name ? 'Will be removed' : 'Not in group')}
                        </div>
                      </label>
                    )
                  })}

                {contacts.filter((c) => c.name.toLowerCase().includes(manageSearch.trim().toLowerCase())).length === 0 && (
                  <div className="px-3 py-6 text-sm text-white/35">
                    No contacts found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={closeManage}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveManage}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all"
                >
                  Save
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { suppressAutoOpenRef.current = true; setCreateOpen(false); setEditGroup(null) }} />
            {/* Clear query on close */}
            {false}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="text-lg font-semibold text-white">
                  {editGroup ? 'Edit Group' : 'Create Group'}
                </div>
                <button
                  onClick={() => {
                    suppressAutoOpenRef.current = true
                    setCreateOpen(false); setEditGroup(null)
                    const url = new URL(window.location.href)
                    url.searchParams.delete('groupModal')
                    url.searchParams.delete('id')
                    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
                  }}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <label className="block text-sm text-white/70">Group name</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                />
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    suppressAutoOpenRef.current = true
                    setCreateOpen(false); setEditGroup(null)
                    const url = new URL(window.location.href)
                    url.searchParams.delete('groupModal')
                    url.searchParams.delete('id')
                    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    suppressAutoOpenRef.current = true
                    if (!groupNameInput.trim()) return
                    if (editGroup) {
                      setGroups((gs) => gs.map(g => g.id === editGroup.id ? { ...g, name: groupNameInput.trim() } : g))
                      // Переименовать связи в контактах
                      const oldName = editGroup.name
                      const newName = groupNameInput.trim()
                      setContacts((cs) => cs.map(c => c.group === oldName ? { ...c, group: newName } : c))
                      setEditGroup(null)
                    } else {
                      const name = groupNameInput.trim()
                      const newGroup: Group = {
                        id: String(Date.now()),
                        name,
                        members: 0,
                        lastUsed: 'just now',
                        color: 'from-indigo-500 to-purple-500',
                        initial: name.charAt(0).toUpperCase() || 'G',
                      }
                      setGroups((gs) => [newGroup, ...gs])
                      setCreateOpen(false)
                    }
                    const url = new URL(window.location.href)
                    url.searchParams.delete('groupModal')
                    url.searchParams.delete('id')
                    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple transition-all"
                >
                  Save
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
              <div className="px-5 py-4 border-b border-white/[0.06] text-lg font-semibold text-white">Delete Group</div>
              <div className="px-5 py-4 text-sm text-white/70">
                Are you sure you want to delete group “{deleteGroup.name}”? Contacts in this group will be unassigned.
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteGroup(null)}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = deleteGroup.name
                    setGroups((gs) => gs.filter(g => g.id !== deleteGroup.id))
                    setContacts((cs) => cs.map(c => c.group === name ? { ...c, group: '' } : c))
                    setDeleteGroup(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 border border-pink-500/30 hover:shadow-glow-purple transition-all"
                >
                  Delete
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
