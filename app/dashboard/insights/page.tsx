"use client"

import { motion } from "framer-motion"
import {
  Lightbulb, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart,
  Smartphone, ArrowRight, Sparkles, RefreshCcw,
} from "lucide-react"
import { insightsData } from "@/lib/mock-data"

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Smartphone,
}

const severityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
  Warning: {
    label: "Warning",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
  Opportunity: {
    label: "Opportunity",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
}

export default function InsightsPage() {
  const criticalCount = insightsData.filter((i) => i.severity === "Critical").length
  const warningCount = insightsData.filter((i) => i.severity === "Warning").length
  const opportunityCount = insightsData.filter((i) => i.severity === "Opportunity").length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
            <p className="text-sm text-slate-400">Powered by Deployable Intelligence Engine</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/3 self-start sm:self-auto">
          <RefreshCcw className="w-4 h-4" />
          Refresh insights
        </button>
      </motion.div>

      {/* Summary badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm font-semibold text-red-400">{criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/20 bg-amber-500/10">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm font-semibold text-amber-400">{warningCount} Warning</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{opportunityCount} Opportunity</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/3">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-400">Last updated: 2 min ago</span>
        </div>
      </motion.div>

      {/* Insights list */}
      <div className="space-y-4">
        {insightsData.map((insight, i) => {
          const severity = severityConfig[insight.severity]
          const Icon = iconMap[insight.icon] || AlertTriangle

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`rounded-xl border p-5 ${severity.bg} hover:scale-[1.01] transition-transform duration-200`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${severity.bg} border`}>
                  <Icon className={`w-5 h-5 ${severity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${severity.bg} ${severity.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
                      {insight.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {insight.metric}
                    </span>
                  </div>

                  <h3 className="font-bold text-white mb-1.5 leading-tight">{insight.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-4 flex justify-end">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  insight.severity === "Critical"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                    : insight.severity === "Warning"
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20"
                    : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
                }`}>
                  {insight.action}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Pro tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex items-start gap-3"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400">
          <span className="text-cyan-400 font-semibold">Pro tip:</span> Addressing Critical insights first can recover 15-40% of leaking revenue. Our AI generates new insights every 6 hours based on your live data.
        </p>
      </motion.div>
    </div>
  )
}
