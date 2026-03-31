import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Утилита для объединения классов Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование числа с разделителями
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

// Сокращение длинного текста
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// Получение инициалов из имени
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Цвет статуса SMS
export function getStatusColor(status: string): string {
  switch (status) {
    case 'sent': return 'badge-sent'
    case 'delivered': return 'badge-delivered'
    case 'failed': return 'badge-failed'
    case 'pending': return 'badge-pending'
    default: return 'badge-sent'
  }
}

// Иконка статуса
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'sent': return '✓'
    case 'delivered': return '✓✓'
    case 'failed': return '✗'
    case 'pending': return '⏳'
    default: return '✓'
  }
}
