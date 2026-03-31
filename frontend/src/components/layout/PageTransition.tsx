'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

// Анимация перехода между страницами
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -12,
  },
}

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.35,
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
