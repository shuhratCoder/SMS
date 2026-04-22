'use client'

import { motion } from 'framer-motion'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-[220px] right-0 z-30 h-[72px]"
    >
      {/* Фон хедера */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl border-b border-white/[0.05]" />

      {/* Содержимое */}
      <div className="relative z-10 h-full flex items-center justify-end px-6 gap-3">
        <LanguageSwitcher />

        {/* Аватар пользователя */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500/40 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
