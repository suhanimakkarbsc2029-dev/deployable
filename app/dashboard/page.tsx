"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import {
  TrendingUp, DollarSign, ShoppingBag, Users, Target, BarChart3,
  ChevronDown, ArrowUpRight, RefreshCcw, AlertTriangle, CheckCircle2,
  Zap, Brain, TrendingDown, ArrowRight, Sparkles,
} from "lucide-react"
import KPICard from "@/components/dashboard/KPICard"
import { KPICardSkeleton, ChartSkeleton } from "@/components/dashboard/Skeletons"
import MetaBanner from "@/components/dashboard/MetaBanner"
import { formatINR } from "@/lib/utils"
import type { MetaAd, AccountInsights, DailyInsight } from "@/lib/meta"
import type { DashboardAnalysis, ConversionProblem } from "@/app/api/analysis/route"

// ── Types ──────────────────────────────────────────────────────────────────────

interface OverviewResponse {
  connected: boolean
  source: "live" | "mock"
  aggregate: AccountInsights
  daily: DailyInsight[]
  ads: MetaAd[]
  error?: string
}

interface WebsiteStats {
  hasPixel: boolean
  hasData: boolean
  data: {
    sessions: number
    orderCount: number
    bounceRate: number
    conversionRate: number
    cartAbandonmentRate: number
    funnelDropoffs: {
      visitToProductView: number
      productViewToCart: number
      cartToCheckout: number
      checkoutToPurchase: number
    }
  } | null
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DATE_RANGES = ["Last 7 days", "Last 14 days", "Last 30 days", "This month"]
const DATE_PRESET: Record<string, string> = {
  "Last 7 days": "last_7d",
  "Last 14 days": "last_14d",
  "Last 30 days": "last_30d",
  "This month": "this_month",
}

// ── Problem card ───────────────────────────────────────────────────────────────

function ProblemCard({
  problem,
  currentMetrics,
  index,
}: {
  problem: ConversionProblem
  currentMetrics: Record<string, number>
  index: number
}) {
  const liveValue = currentMetrics[problem.fixCheckKey] ?? null
  const isFixed = liveValue !== null && (
    problem.fixCheckDirection === "below"
      ? liveValue < problem.fixCheckThreshold
      : liveValue > problem.fixCheckThreshold
  )

  const liftPct = ((problem.projectedCvr - problem.predictedLift) > 0
    ? ((problem.predictedLift / Math.max(problem.projectedCvr - problem.predictedLift, 0.01)) * 100)
    : 0
  ).toFixed(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`rounded-xl border p-5 relative overflow-hidden transition-all duration-300 ${
        isFixed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : problem.severity === "Critical"
          ? "border-red-500/20 bg-red-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      }`}
    >
      {/* Fixed badge */}
      <AnimatePresence>
        {isFixed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Fixed</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isFixed
            ? "bg-emerald-500/15 border border-emerald-500/20"
            : problem.severity === "Critical"
            ? "bg-red-500/15 border border-red-500/20"
            : "bg-amber-500/15 border border-amber-500/20"
        }`}>
          {isFixed
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            : problem.severity === "Critical"
            ? <AlertTriangle className="w-4 h-4 text-red-400" />
            : <TrendingDown className="w-4 h-4 text-amber-400" />
          }
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isFixed
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : problem.severity === "Critical"
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}>
              {isFixed ? "Resolved" : problem.severity}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm leading-tight mb-1">{problem.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{problem.description}</p>
        </div>
      </div>

      {/* Metric vs benchmark */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/3 rounded-lg p-2.5">
          <p className="text-[10px] text-slate-500 mb-0.5">Metric</p>
          <p className="text-xs font-semibold text-slate-300">{problem.metricAffected}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${isFixed ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
          <p className="text-[10px] text-slate-500 mb-0.5">Current</p>
          <p className={`text-xs font-bold ${isFixed ? "text-emerald-400" : "text-red-400"}`}>
            {problem.currentValue}
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-2.5">
          <p className="text-[10px] text-slate-500 mb-0.5">Benchmark</p>
          <p className="text-xs font-semibold text-emerald-400">{problem.benchmarkValue}</p>
        </div>
      </div>

      {/* CVR lift prediction */}
      {!isFixed && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">Predicted lift if fixed</span>
            </div>
            <span className="text-xs font-black text-cyan-300">+{liftPct}% CVR</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Current CVR</span>
                <span>Projected CVR</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: "40%" }} />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((problem.projectedCvr / 5) * 100, 100)}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-black text-white">{problem.projectedCvr.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Fix hint */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {isFixed ? "Keep monitoring this metric" : problem.fixHint}
        </span>
        {!isFixed && (
          <button className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
            problem.severity === "Critical"
              ? "text-red-400 hover:text-red-300"
              : "text-amber-400 hover:text-amber-300"
          }`}>
            Fix now <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Health score ring ──────────────────────────────────────────────────────────

function HealthRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#f87171"

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[10px] text-slate-500">/ 100</span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [showRangeMenu, setShowRangeMenu] = useState(false)

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [website, setWebsite] = useState<WebsiteStats | null>(null)
  const [analysis, setAnalysis] = useState<DashboardAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const preset = DATE_PRESET[dateRange] ?? "last_30d"

  const loadData = useCallback(async () => {
    setLoading(true)
    setAnalysis(null)

    const [ovRes, pixelRes] = await Promise.all([
      fetch(`/api/meta/overview?date_preset=${preset}`).then((r) => r.json() as Promise<OverviewResponse>),
      fetch(`/api/website/stats?date_preset=${preset}`).then((r) => r.json() as Promise<WebsiteStats>).catch(() => null),
    ])

    setOverview(ovRes)
    setWebsite(pixelRes)
    setLoading(false)

    // Fire analysis after data loads
    const agg = ovRes?.aggregate
    const webData = pixelRes?.data
    const metaConnected = ovRes?.connected === true && ovRes?.source === "live"
    const pixelConnected = pixelRes?.hasData === true

    const hasData = metaConnected || pixelConnected
    if (!hasData) return

    setAnalysisLoading(true)
    try {
      const analysisRes = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaConnected,
          pixelConnected,
          roas: agg?.roas ?? 0,
          revenue: agg?.revenue ?? 0,
          adSpend: agg?.spend ?? 0,
          orders: webData?.orderCount ?? 0,
          ctr: agg ? parseFloat(((agg.clicks / Math.max(agg.impressions, 1)) * 100).toFixed(2)) : 0,
          cpc: agg && agg.clicks > 0 ? parseFloat(((agg.spend ?? 0) / agg.clicks).toFixed(2)) : 0,
          cac: webData?.orderCount && agg ? Math.round((agg.spend ?? 0) / webData.orderCount) : 0,
          bounceRate: webData?.bounceRate ?? 0,
          conversionRate: webData?.conversionRate ?? 0,
          cartAbandonmentRate: webData?.cartAbandonmentRate ?? 0,
          funnelDropoffs: webData?.funnelDropoffs ?? { visitToProductView: 0, productViewToCart: 0, cartToCheckout: 0, checkoutToPurchase: 0 },
          topCampaignRoas: agg?.roas ?? 0,
          worstCampaignRoas: agg?.roas ?? 0,
          sessions: webData?.sessions ?? 0,
        }),
      })
      const json = await analysisRes.json() as DashboardAnalysis & { error?: string }
      if (!json.error) setAnalysis(json)
    } catch { /* silent */ } finally {
      setAnalysisLoading(false)
    }
  }, [preset])

  useEffect(() => { loadData() }, [loadData])

  // Build live metric map for fix-check comparison
  const webData = website?.data
  const agg = overview?.aggregate
  const liveMetrics: Record<string, number> = {
    cartAbandonmentRate: webData?.cartAbandonmentRate ?? 999,
    bounceRate: webData?.bounceRate ?? 999,
    conversionRate: webData?.conversionRate ?? 0,
    ctr: agg ? parseFloat(((agg.clicks / Math.max(agg.impressions, 1)) * 100).toFixed(2)) : 0,
    roas: agg?.roas ?? 0,
    cpc: agg && agg.clicks > 0 ? parseFloat(((agg.spend ?? 0) / agg.clicks).toFixed(2)) : 999,
    checkoutToPurchase: webData?.funnelDropoffs?.checkoutToPurchase ?? 999,
    cartToCheckout: webData?.funnelDropoffs?.cartToCheckout ?? 999,
    productViewToCart: webData?.funnelDropoffs?.productViewToCart ?? 999,
    visitToProductView: webData?.funnelDropoffs?.visitToProductView ?? 999,
  }

  const connected = overview?.connected ?? false
  const isLive = overview?.source === "live"
  const metaError = overview?.error ?? null
  const daily = overview?.daily ?? []

  const liveOrders = webData?.orderCount ?? null
  const liveRoas = agg?.roas
  const liveRevenue = agg?.revenue
  const liveSpend = agg?.spend
  const liveCac = liveSpend && liveOrders ? Math.round(liveSpend / liveOrders) : null
  const liveMer = liveRevenue && liveSpend && liveSpend > 0
    ? parseFloat((liveRevenue / liveSpend).toFixed(2)) : null

  const kpis = [
    { title: "ROAS", value: isLive ? `${liveRoas ?? 0}x` : "—", delta: null, icon: TrendingUp, iconColor: "text-cyan-400" },
    { title: "Revenue", value: isLive ? formatINR(liveRevenue ?? 0) : "—", delta: null, icon: DollarSign, iconColor: "text-emerald-400" },
    { title: "Ad Spend", value: isLive ? formatINR(liveSpend ?? 0) : "—", delta: null, icon: Target, iconColor: "text-blue-400" },
    { title: "Orders", value: liveOrders != null ? liveOrders.toLocaleString("en-IN") : "—", delta: null, icon: ShoppingBag, iconColor: "text-violet-400" },
    { title: "CAC", value: liveCac != null ? `₹${liveCac}` : "—", delta: null, icon: Users, iconColor: "text-pink-400" },
    { title: "MER", value: liveMer != null ? `${liveMer}x` : "—", delta: null, icon: BarChart3, iconColor: "text-amber-400" },
  ]

  const fixedCount = analysis
    ? analysis.problems.filter((p) => {
        const live = liveMetrics[p.fixCheckKey] ?? null
        if (live === null) return false
        return p.fixCheckDirection === "below" ? live < p.fixCheckThreshold : live > p.fixCheckThreshold
      }).length
    : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">Overview</h1>
          <p className="text-sm text-slate-400">
            Your store&apos;s performance at a glance
            {overview?.source === "live" && (
              <span className="ml-2 text-xs text-emerald-400 font-medium">● Live</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all"
              onClick={() => setShowRangeMenu(!showRangeMenu)}
            >
              {dateRange}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showRangeMenu && (
              <div className="absolute right-0 top-11 w-44 rounded-xl border border-white/10 bg-[#0a1628] shadow-xl z-20 overflow-hidden">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${r === dateRange ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    onClick={() => { setDateRange(r); setShowRangeMenu(false) }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/25 transition-all">
            <ArrowUpRight className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Meta banner */}
      {!loading && <MetaBanner connected={connected} isLive={isLive} error={metaError} />}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis.map((kpi, i) => <KPICard key={kpi.title} {...kpi} index={i} />)
        }
      </div>

      {/* Analysis + Chart row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">

        {/* Conversion analysis panel — 2/3 width */}
        <div className="xl:col-span-2 space-y-4">

          {/* Health + summary header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/8 bg-white/3 p-5"
          >
            <div className="flex items-center gap-4">
              {analysisLoading ? (
                <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
              ) : analysis ? (
                <HealthRing score={analysis.overallHealthScore} />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-slate-700" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Conversion Health</span>
                  {analysis && fixedCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {fixedCount} fixed
                    </span>
                  )}
                </div>
                {analysisLoading ? (
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                ) : analysis ? (
                  <>
                    <p className="text-sm text-slate-300 leading-relaxed mb-2">{analysis.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        Current CVR: <span className="text-white font-semibold ml-1">{analysis.currentCvr}%</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        Potential CVR: <span className="text-cyan-400 font-semibold ml-1">{analysis.projectedCvrIfAllFixed}%</span>
                      </span>
                    </div>
                  </>
                ) : !loading ? (
                  <p className="text-sm text-slate-500">Connect Meta Ads or install the pixel to get conversion analysis.</p>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Problem cards */}
          {analysisLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5 animate-pulse h-40" />
              ))}
            </div>
          ) : analysis ? (
            <div className="space-y-3">
              {analysis.problems.map((p, i) => (
                <ProblemCard
                  key={p.id}
                  problem={p}
                  currentMetrics={liveMetrics}
                  index={i}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Revenue vs Spend chart — 1/3 width */}
        <div className="space-y-4">
          {loading ? (
            <ChartSkeleton height={280} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/8 bg-white/3 p-5"
            >
              <div className="mb-4">
                <h2 className="font-semibold text-white text-sm">Revenue vs Ad Spend</h2>
                <p className="text-xs text-slate-500 mt-0.5">{dateRange}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />Spend
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={daily} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c4f0" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00c4f0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSpd2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11 }}
                    labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                    formatter={(v: number, name: string) => [`₹${(v / 100000).toFixed(1)}L`, name === "revenue" ? "Revenue" : "Ad Spend"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00c4f0" strokeWidth={2} fill="url(#gradRev2)" dot={false} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fill="url(#gradSpd2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* CVR projection card */}
          {!loading && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-300">CVR Projection</span>
              </div>
              <div className="space-y-2">
                {analysis.problems.map((p) => {
                  const live = liveMetrics[p.fixCheckKey] ?? null
                  const fixed = live !== null && (
                    p.fixCheckDirection === "below" ? live < p.fixCheckThreshold : live > p.fixCheckThreshold
                  )
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border ${
                        fixed
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-white/5 border-white/15"
                      }`}>
                        {fixed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                      </div>
                      <span className={`text-xs flex-1 truncate ${fixed ? "line-through text-slate-600" : "text-slate-400"}`}>
                        {p.title}
                      </span>
                      <span className={`text-xs font-semibold flex-shrink-0 ${fixed ? "text-slate-600" : "text-cyan-400"}`}>
                        {fixed ? "✓" : `+${p.predictedLift}pp`}
                      </span>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Projected CVR</span>
                  <span className="text-sm font-black text-cyan-300">{analysis.projectedCvrIfAllFixed}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Top Ads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-white/8 bg-white/3 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="font-semibold text-white">Top Ad Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Best performing ads this period
              {overview?.source === "live" && (
                <span className="ml-1.5 text-emerald-400 font-medium">● Live</span>
              )}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Ad Name", "Campaign", "Spend", "Revenue", "ROAS", "CTR", "CPC", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/3">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="skeleton h-4 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (overview?.ads ?? []).map((ad, i) => (
                    <motion.tr
                      key={ad.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="border-b border-white/3 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap max-w-[200px] truncate">{ad.name}</td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{ad.campaign}</td>
                      <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{formatINR(ad.spend)}</td>
                      <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{formatINR(ad.revenue)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`font-bold ${ad.roas >= 3 ? "text-emerald-400" : ad.roas >= 2 ? "text-amber-400" : "text-red-400"}`}>
                          {ad.roas}x
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{ad.ctr}%</td>
                      <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">₹{ad.cpc}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          ad.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : ad.status === "Learning"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
