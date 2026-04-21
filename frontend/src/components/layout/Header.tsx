'use client'

import { motion } from 'framer-motion'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false)

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
      <div className="relative z-10 h-full flex items-center justify-end px-6">

        {/* Поиск */}
        {/* <div className={`
          relative flex items-center gap-2.5 px-4 py-2 rounded-xl w-72
          border transition-all duration-200
          ${searchFocused
            ? 'bg-white/[0.08] border-purple-500/40 shadow-glow-sm'
            : 'bg-white/[0.04] border-white/[0.08]'
          }
        `}>
          <Search className="w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm text-white/80 placeholder-white/25 outline-none w-full"
          />
        </div> */}

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {/* Поиск (иконка) */}
          {/* <button className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all">
            <Search className="w-4 h-4" />
          </button> */}

          {/* Уведомления */}
          {/* <button className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-bg-primary">
              3
            </span>
          </button> */}

          {/* Аватар пользователя */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500/40 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            {/* <ChevronDown className="w-3 h-3 text-white/40" /> */}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
