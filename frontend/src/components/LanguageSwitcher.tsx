'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import { Lang, useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const options: { code: Lang; label: string; short: string }[] = [
  { code: 'uz', label: "O'zbek",  short: "O'z" },
  { code: 'ru', label: 'Русский', short: 'Рус' },
  { code: 'en', label: 'English', short: 'Eng' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const current = options.find((o) => o.code === lang) ?? options[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
          'bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white/90 hover:border-purple-500/30',
          open && 'bg-white/[0.08] border-purple-500/40 text-white'
        )}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden z-50"
          >
            {options.map((opt) => {
              const active = opt.code === lang
              return (
                <button
                  key={opt.code}
                  onClick={() => { setLang(opt.code); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm transition-all',
                    active
                      ? 'bg-purple-500/15 text-purple-200'
                      : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <span>{opt.label}</span>
                  {active && <Check className="w-4 h-4 text-purple-300" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
