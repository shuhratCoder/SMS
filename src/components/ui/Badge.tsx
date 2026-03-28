import { cn } from '@/lib/utils'

type BadgeVariant = 'sent' | 'delivered' | 'failed' | 'pending' | 'active' | 'inactive'

interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  sent:      'badge-sent',
  delivered: 'badge-delivered',
  failed:    'badge-failed',
  pending:   'badge-pending',
  active:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  inactive:  'bg-white/10 text-white/40 border border-white/10',
}

const variantLabels: Record<BadgeVariant, string> = {
  sent:      '✓ Sent',
  delivered: '✓✓ Delivered',
  failed:    '✗ Failed',
  pending:   '⏳ Pending',
  active:    'Active',
  inactive:  'Inactive',
}

// Универсальный бейдж статуса
export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children ?? variantLabels[variant]}
    </span>
  )
}
