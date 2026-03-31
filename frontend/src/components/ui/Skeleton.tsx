'use client'

import { motion } from 'framer-motion'

// Скелетон для одной строки таблицы
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03]">
      <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-4 w-28 ml-auto" />
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  )
}

// Скелетон для карточки статистики
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
      <div className="skeleton h-9 w-9 rounded-xl" />
      <div className="skeleton h-7 w-20" />
      <div className="skeleton h-4 w-28" />
    </div>
  )
}

// Скелетон таблицы (несколько строк)
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <TableRowSkeleton />
        </motion.div>
      ))}
    </div>
  )
}
