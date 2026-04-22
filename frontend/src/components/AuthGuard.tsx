'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      localStorage.removeItem('token')
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
