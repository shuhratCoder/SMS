'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { CalendarDays, ChevronDown, Send, Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { groups, contacts } from '@/lib/mock-data'

interface SendSmsForm {
  recipients: string
  message: string
  schedule: string
}

const MAX_CHARS = 160

export default function SendSmsPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SendSmsForm>()
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const messageValue = watch('message') || ''
  const charCount = messageValue.length
  const smsCount = Math.ceil(charCount / MAX_CHARS) || 0

  // Все варианты получателей (группы + контакты)
  const allRecipients = [
    ...groups.map((g) => ({ id: `group-${g.id}`, label: `📁 ${g.name}`, count: g.members })),
    ...contacts.slice(0, 8).map((c) => ({ id: `contact-${c.id}`, label: `${c.flag} ${c.name}`, count: 1 })),
  ]

  const selected = allRecipients.find((r) => r.id === selectedRecipient)

  // Мок отправки
  const onSubmit = async (data: SendSmsForm) => {
    setIsSending(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Send SMS
      </motion.h1>

      <GlassCard delay={0.1} className="max-w-3xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Send SMS</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Выбор получателей */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Select Group or Contacts
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    bg-white/[0.04] border transition-all text-sm text-left
                    ${showDropdown
                      ? 'border-purple-500/40 bg-white/[0.07] shadow-glow-sm'
                      : 'border-white/[0.08] hover:border-white/20'
                    }
                  `}
                >
                  <span className={selected ? 'text-white/85' : 'text-white/25'}>
                    {selected ? selected.label : 'Select group or contacts'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </div>
                </button>

                {/* Дропдаун */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto py-1">
                        {/* Заголовок групп */}
                        <div className="px-4 py-2 text-xs text-white/30 uppercase tracking-wider">Groups</div>
                        {allRecipients.filter(r => r.id.startsWith('group')).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { setSelectedRecipient(r.id); setShowDropdown(false) }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-all text-left"
                          >
                            <span>{r.label}</span>
                            <span className="text-white/30">{r.count} members</span>
                          </button>
                        ))}

                        {/* Заголовок контактов */}
                        <div className="px-4 py-2 text-xs text-white/30 uppercase tracking-wider border-t border-white/[0.06] mt-1">Contacts</div>
                        {allRecipients.filter(r => r.id.startsWith('contact')).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { setSelectedRecipient(r.id); setShowDropdown(false) }}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-all text-left"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Поле сообщения */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Message
              </label>
              <div className="relative">
                <textarea
                  {...register('message', {
                    required: 'Message is required',
                    maxLength: { value: MAX_CHARS * 3, message: 'Too long' }
                  })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/20 outline-none resize-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="Type your message here..."
                />
                {/* Счётчик символов */}
                <div className="absolute bottom-3 right-3 text-xs text-white/30">
                  {charCount} / {MAX_CHARS} characters
                </div>
              </div>
              {errors.message && (
                <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
              )}
            </div>

            {/* Планировщик */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Schedule
              </label>
              <div className="relative flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-purple-500/40 transition-all">
                <CalendarDays className="w-4 h-4 text-white/30 flex-shrink-0" />
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white/60 placeholder-white/25 outline-none"
                  placeholder="Select date & time (optional)"
                />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Оценочное количество SMS */}
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span>Est. SMS Count:</span>
              <span className="text-white font-semibold">{smsCount || 0}</span>
            </div>

            {/* Кнопка отправки */}
            <motion.button
              type="submit"
              disabled={isSending || !selectedRecipient}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full py-4 rounded-2xl font-bold text-white text-sm
                relative overflow-hidden transition-all duration-300
                ${sent
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-glow-cyan'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isSending ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </motion.span>
                ) : sent ? (
                  <motion.span
                    key="sent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Sent Successfully!
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send SMS
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Подсказка */}
            <p className="text-center text-xs text-white/30">
              Scheduling is optional. SMS will be sent immediately if no date & time is selected.
            </p>
          </form>
        </div>
      </GlassCard>
    </div>
  )
}
