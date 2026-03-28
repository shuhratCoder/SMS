'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  // Варианты карточки
  variant?: 'default' | 'accent' | 'dark' | 'neon'
  // Анимация при ховере
  hoverable?: boolean
  // Задержка анимации появления
  delay?: number
  onClick?: () => void
}

// Стили для каждого варианта
const variants = {
  default: 'bg-white/[0.04] border-white/10',
  accent: 'bg-purple-500/[0.08] border-purple-500/20',
  dark: 'bg-black/30 border-white/[0.06]',
  neon: 'bg-purple-500/[0.05] border-purple-500/30 shadow-glow-sm',
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hoverable = false,
  delay = 0,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hoverable ? { scale: 1.015, y: -2 } : undefined}
      onClick={onClick}
      className={cn(
        // Базовые стили стекла
        'rounded-2xl backdrop-blur-xl border transition-all duration-300',
        // Тень
        'shadow-glass',
        // Вариант
        variants[variant],
        // Ховер эффект
        hoverable && 'cursor-pointer hover:border-purple-500/30 hover:shadow-glow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Маленькая статистическая карточка для дашборда
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changePositive?: boolean
  gradient?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  icon,
  change,
  changePositive = true,
  gradient = 'from-purple-500/20 to-blue-500/10',
  delay = 0,
}: StatCardProps) {
  return (
    <GlassCard
      variant="default"
      hoverable
      delay={delay}
      className={`p-5 bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-white/[0.08] backdrop-blur-sm">
          {icon}
        </div>
        {change && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            changePositive
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-red-400 bg-red-400/10'
          )}>
            {changePositive ? '+' : ''}{change}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-white font-display">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-white/50 mt-0.5">{title}</p>
      </div>
    </GlassCard>
  )
}
