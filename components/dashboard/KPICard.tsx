"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  delta: number
  deltaLabel?: string
  icon: LucideIcon
  iconColor?: string
  index?: number
  loading?: boolean
}

export default function KPICard({
  title,
  value,
  delta,
  deltaLabel = "vs last month",
  icon: Icon,
  iconColor = "text-cyan-400",
  index = 0,
  loading = false,
}: KPICardProps) {
  const positive = delta >= 0

  if (loading) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <div className="skeleton h-3 w-20 rounded mb-3" />
        <div className="skeleton h-7 w-28 rounded mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border border-white/8 bg-white/3 p-5 group hover:border-white/15 transition-all duration-300 hover:bg-white/5"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-white mb-1.5 tracking-tight">{value}</p>
      <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{positive ? "+" : ""}{delta}%</span>
        <span className="text-slate-500 font-normal">{deltaLabel}</span>
      </div>
    </motion.div>
  )
}
