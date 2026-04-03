"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lightbulb, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart,
  Smartphone, ArrowRight, Sparkles, RefreshCcw, Cpu,
} from "lucide-react"
import type { AIInsight } from "@/app/api/insights/route"
import {
  kpiData, websiteKpis, funnelData, campaignsData,
} from "@/lib/mock-data"

// ── Icon pool — Claude picks severity, we pick icon by position ───────────────
const ICONS = [AlertTriangle, TrendingDown, ShoppingCart, Smartphone, TrendingUp]

const severityConfig: Record<string, { color: string; bg: string; dot: string; actionCls: string }> = {
  Critical: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
    actionCls: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20",
  },
  Warning: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    actionCls: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20",
  },
  Opportunity: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    actionCls: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20",
  },
}

// ── Build metrics payload from mock data (same shape as live data later) ──────
function buildMetrics() {
  const funnel = funnelData
  const topRoas = Math.max(...campaignsData.map((c) => c.roas))
  const worstRoas = Math.min(...campaignsData.map((c) => c.roas))

  return {
    roas: kpiData.roas,
    revenue: kpiData.revenue,
    adSpend: kpiData.adSpend,
    orders: kpiData.orders,
    ctr: 3.2,
    cpc: 22.4,
    cac: kpiData.cac,
    bounceRate: websiteKpis.bounceRate,
    conversionRate: websiteKpis.conversionRate,
    cartAbandonmentRate: 72,
    funnelDropoffs: {
      visitToProductView: Math.round(((funnel[0].users - funnel[1].users) / funnel[0].users) * 100),
      productViewToCart: Math.round(((funnel[1].users - funnel[2].users) / funnel[1].users) * 100),
      cartToCheckout: Math.round(((funnel[2].users - funnel[3].users) / funnel[2].users) * 100),
      checkoutToPurchase: Math.round(((funnel[3].users - funnel[4].users) / funnel[3].users) * 100),
    },
    topCampaignRoas: topRoas,
    worstCampaignRoas: worstRoas,
    mobileConversionRate: 1.6,
    desktopConversionRate: 3.8,
  }
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function InsightSkeleton() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-5/6 rounded" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>
    </div>
  )
}

// ── Thinking animation ────────────────────────────────────────────────────────
function ThinkingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 mb-6"
    >
      <Cpu className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-cyan-300">Claude is analysing your metrics…</p>
        <p className="text-xs text-slate-500 mt-0.5">Reading ROAS, funnel drop-offs, and campaign performance</p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"claude" | "mock" | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMetrics()),
      })

      const json = await res.json() as {
        insights: AIInsight[]
        source: "claude" | "mock"
        error?: string
      }

      setInsights(json.insights)
      setSource(json.source)
      setLastUpdated(new Date())
      if (json.error) setError(json.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch insights")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  const criticalCount = insights.filter((i) => i.severity === "Critical").length
  const warningCount = insights.filter((i) => i.severity === "Warning").length
  const opportunityCount = insights.filter((i) => i.severity === "Opportunity").length

  function formatLastUpdated(d: Date) {
    const diff = Math.round((Date.now() - d.getTime()) / 1000)
    if (diff < 10) return "just now"
    if (diff < 60) return `${diff}s ago`
    return `${Math.round(diff / 60)}m ago`
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
            <p className="text-sm text-slate-400">
              {source === "claude"
                ? "Powered by Claude claude-sonnet-4-20250514"
                : "Powered by Deployable Intelligence Engine"}
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/3 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analysing…" : "Refresh insights"}
        </button>
      </motion.div>

      {/* Thinking banner */}
      <AnimatePresence>
        {loading && <ThinkingBanner />}
      </AnimatePresence>

      {/* Summary badges */}
      {!loading && insights.length > 0 && (
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
            {source === "claude" ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">Live · Claude</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-400">Demo data</span>
              </>
            )}
            {lastUpdated && (
              <span className="text-xs text-slate-500 ml-1">· {formatLastUpdated(lastUpdated)}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Insights list */}
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <InsightSkeleton key={i} />)
          : insights.map((insight, i) => {
              const cfg = severityConfig[insight.severity] ?? severityConfig["Warning"]
              const Icon = ICONS[i % ICONS.length]

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl border p-5 ${cfg.bg} hover:scale-[1.005] transition-transform duration-200`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {insight.severity}
                        </span>
                        {source === "claude" && (
                          <span className="flex items-center gap-1 text-xs text-cyan-500 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded-full font-medium">
                            <Sparkles className="w-2.5 h-2.5" />
                            Claude
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white mb-1.5 leading-tight">{insight.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-4 flex justify-end">
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${cfg.actionCls}`}>
                      {insight.action}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })
        }
      </div>

      {/* Error note (non-blocking — shown under results when API degraded) */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 px-4 py-3 rounded-xl border border-white/8 bg-white/3 flex items-center gap-2"
        >
          <span className="text-xs text-slate-500">
            ⚠ API note: {error.slice(0, 120)}{error.length > 120 ? "…" : ""}
          </span>
        </motion.div>
      )}

      {/* Pro tip */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex items-start gap-3"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400">
            <span className="text-cyan-400 font-semibold">Pro tip:</span>{" "}
            {source === "claude"
              ? "These insights were generated live by Claude based on your current metrics. Hit Refresh to re-analyse with the latest data."
              : "Add ANTHROPIC_API_KEY to your .env.local to get live AI-generated insights from Claude instead of demo data."}
          </p>
        </motion.div>
      )}
    </div>
  )
}
