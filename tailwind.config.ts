import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Основные фоны
        'bg-deep': '#06030f',
        'bg-primary': '#0a0520',
        'bg-secondary': '#0d0730',

        // Неоновые акценты
        'neon-purple': '#7c3aed',
        'neon-blue': '#2563eb',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899',
        'neon-green': '#10b981',

        // Стеклянные оттенки
        'glass-white': 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(255,255,255,0.10)',
      },

      // Кастомные тени с неоновым свечением
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.1)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.4), 0 0 40px rgba(37, 99, 235, 0.1)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.1)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.1)',
        'glow-sm': '0 0 10px rgba(124, 58, 237, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
      },

      // Фоновые изображения (градиенты)
      backgroundImage: {
        'gradient-main': 'linear-gradient(180deg, #0a0520 0%, #06030f 100%)',
        'gradient-purple-blue': 'linear-gradient(135deg, #7c3aed, #2563eb)',
        'gradient-blue-cyan': 'linear-gradient(135deg, #2563eb, #06b6d4)',
        'gradient-pink-purple': 'linear-gradient(135deg, #ec4899, #7c3aed)',
        'gradient-card': 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.08))',
      },

      // Кастомная размытость
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },

      // Анимации
      animation: {
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },

      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.6), 0 0 60px rgba(124, 58, 237, 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fadeInUp': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // Радиусы
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // Шрифты
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
