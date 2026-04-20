'use client'

import { useEffect, useState ,useRef} from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getInitials } from '@/lib/utils'
import { api } from '@/lib/api'

const ITEMS_PER_PAGE = 8

const avatarColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-yellow-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500'
]

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [contacts, setContacts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [editContact, setEditContact] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteContact, setDeleteContact] = useState(null)
  const suppressAutoOpenRef=useRef(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 🔥 LOAD API
  const loadContacts = () => {
    setLoading(true)
    api.getContacts()
      .then(setContacts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }
  const loadGroups = () => {
    api.getGroups()
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    loadContacts()
    loadGroups()
  }, [])

  // 🔥 FILTER FIX
  const filtered = contacts.filter((c) =>
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneNumber || '').includes(search) ||
    (c.position || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // 🔥 DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete contact?')) return
    await api.deleteContact(id)
    loadContacts()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white font-display"
        >
          Contacts
        </motion.h1>
      </div>

      {/* SEARCH */}
      <motion.div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <Search className="w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-white outline-none"
          />
        </div>

        <button className="px-4 py-2.5 bg-purple-600 rounded-xl text-white">
          <Plus /> Add Contact
        </button>
      </motion.div>

      {loading ? (
        <div className="text-white">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <GlassCard className="overflow-hidden">
          {/* HEADER */}
          <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr] px-5 py-3 text-white/40">
            <div>Full Name</div>
            <div>Phone</div>
            <div>Position</div>
            <div>Actions</div>
          </div>

          {/* ROWS */}
          {paginated.map((c, i) => (
            <div
              key={c.id}
              className="grid grid-cols-[2fr_2fr_2fr_1.5fr] px-5 py-3 border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % 6]} flex items-center justify-center`}
                >
                  {getInitials(c.fullName)}
                </div>
                {c.fullName}
              </div>

              <div>{c.phoneNumber}</div>
              <div>{c.position}</div>

              <div className="flex gap-2">
                <button>
                  <Pencil />
                </button>
                <button onClick={() => handleDelete(c.id)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}

          {/* PAGINATION */}
          <div className="flex justify-between px-5 py-3">
            <button onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft />
            </button>

            <span>{page}</span>

            <button onClick={() => setPage((p) => p + 1)}>
              <ChevronRight />
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  )
}