'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Box } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Тексты для разных языков
const translations = {
  uz: {
    subtitle: 'Admin Panel',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Parol',
    loginBtn: 'Kirish',
    forgotPassword: 'Parolni unutdingizmi?',
  },
  ru: {
    subtitle: 'Панель Администратора',
    usernamePlaceholder: 'Имя пользователя',
    passwordPlaceholder: 'Пароль',
    loginBtn: 'Войти',
    forgotPassword: 'Забыли пароль?',
  },
  en: {
    subtitle: 'Admin Panel',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    loginBtn: 'Login',
    forgotPassword: 'Forgot password?',
  },
}

import { api } from '@/lib/api'

type Lang = 'uz' | 'ru' | 'en'

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('uz')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const t = translations[lang]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const result = await api.login(username, password)
      if (!result.token) {
        throw new Error('Token topilmadi')
      }
      localStorage.setItem('token', result.token)
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Login xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Фоновые световые эффекты */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Карточка входа */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative">
          {/* Внешнее свечение карточки */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-xl" />

          {/* Основная карточка */}
          <div className="relative rounded-3xl backdrop-blur-2xl bg-white/[0.06] border border-white/[0.12] shadow-glass-lg p-8">
            {/* Логотип */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-start mb-8"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-glow-purple">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-white font-bold text-xl tracking-wide font-display">
                  SMS B<span className="text-purple-400">roa</span>DCAST
                </h1>
              </div>
              <p className="text-white/40 text-sm ml-[52px]">{t.subtitle}</p>
            </motion.div>

            {/* Форма */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Поле Username */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  backdrop-blur-sm border transition-all duration-200
                  ${focused === 'username'
                    ? 'bg-white/[0.08] border-purple-500/50 shadow-glow-sm'
                    : 'bg-white/[0.04] border-white/[0.08]'
                  }
                `}
              >
                <Mail className={`w-4 h-4 flex-shrink-0 transition-colors ${focused === 'username' ? 'text-purple-400' : 'text-white/30'}`} />
                <input
                  type="text"
                  placeholder={t.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                  required
                />
              </motion.div>

              {/* Поле Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  backdrop-blur-sm border transition-all duration-200
                  ${focused === 'password'
                    ? 'bg-white/[0.08] border-purple-500/50 shadow-glow-sm'
                    : 'bg-white/[0.04] border-white/[0.08]'
                  }
                `}
              >
                <Lock className={`w-4 h-4 flex-shrink-0 transition-colors ${focused === 'password' ? 'text-purple-400' : 'text-white/30'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                  required
                />
                {/* Точки пароля */}
                {password && (
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              {/* Кнопка входа */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-3.5 rounded-2xl font-bold text-white text-sm
                    bg-gradient-to-r from-purple-600 to-blue-500
                    hover:shadow-glow-purple hover:-translate-y-0.5
                    active:translate-y-0
                    transition-all duration-200
                    disabled:opacity-70 disabled:cursor-not-allowed
                    relative overflow-hidden
                  `}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading...</span>
                    </span>
                  ) : (
                    t.loginBtn
                  )}
                  {/* Блик на кнопке */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>

              {error && (
                <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 mt-2">
                  {error}
                </div>
              )}

              {/* Забыли пароль */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-center text-white/35 text-sm hover:text-white/60 cursor-pointer transition-colors"
              >
                {t.forgotPassword}
              </motion.p>
            </form>

            {/* Переключатель языков */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.06]"
            >
              {(['uz', 'ru', 'en'] as Lang[]).map((l, i) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`
                    text-sm transition-all duration-200
                    ${lang === l
                      ? 'text-white font-semibold'
                      : 'text-white/30 hover:text-white/60'
                    }
                  `}
                >
                  {l === 'uz' ? "O'z" : l === 'ru' ? 'Рус' : 'Eng'}
                </button>
              )).reduce((acc: React.ReactNode[], el, i) => {
                if (i === 0) return [el]
                return [...acc, <span key={`sep-${i}`} className="text-white/20">|</span>, el]
              }, [])}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
