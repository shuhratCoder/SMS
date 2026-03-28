'use client'

import { motion } from 'framer-motion'
import { Bell, Shield, Globe, Palette, Database, Key } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

const settingsSections = [
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure SMS alerts and email notifications',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Two-factor authentication and session management',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Globe,
    title: 'Language & Region',
    description: 'Set your preferred language and timezone',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Theme, colors and display preferences',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Database,
    title: 'SMS Gateway',
    description: 'API configuration and provider settings',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Key,
    title: 'API Keys',
    description: 'Manage your API credentials and tokens',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Settings
      </motion.h1>

      <div className="grid grid-cols-2 gap-4">
        {settingsSections.map((section, i) => {
          const Icon = section.icon
          return (
            <GlassCard key={section.title} delay={i * 0.07} hoverable className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${section.bg}`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{section.title}</h3>
                  <p className="text-white/45 text-xs mt-0.5">{section.description}</p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* SMS Gateway статус */}
      <GlassCard delay={0.4} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">SMS Gateway Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'API Response Time', value: '216 ms', good: true },
            { label: 'Success Rate', value: '96.3%', good: true },
            { label: 'Queue Size', value: '0', good: true },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xs text-white/40">{stat.label}</p>
              <p className="text-lg font-bold text-white mt-1 font-display">{stat.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
