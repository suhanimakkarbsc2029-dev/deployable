"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import {
  TrendingUp, DollarSign, ShoppingBag, Users, Target, BarChart3,
  ChevronDown, ArrowUpRight, RefreshCcw,
} from "lucide-react"
import KPICard from "@/components/dashboard/KPICard"
import ConnectMetaBanner from "@/components/dashboard/ConnectMetaBanner"
import { KPICardSkeleton, ChartSkeleton, TableRowSkeleton } from "@/components/dashboard/Skeletons"
import { kpiData, dailyOrdersData } from "@/lib/mock-data"
import { formatINR } from "@/lib/utils"
import type { MetaAd, AccountInsights, DailyInsight } from "@/lib/meta"

// ── Types ──────────────────────────────────────────────────────────────────

interface InsightsResponse {
  connected: boolean
  source: "live" | "mock"
  data: { aggregate: AccountInsights; daily: DailyInsight[] }
  error?: string
}

interface AdsResponse {
  connected: boolean
  source: "live" | "mock"
  data: MetaAd[]
  error?: string
}

// ── Constants ─────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Learning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const DATE_RANGES = ["Last 7 days", "Last 14 days", "Last 30 days", "This month"]

const DATE_PRESET: Record<string, string> = {
  "Last 7 days": "last_7d",
  "Last 14 days": "last_14d",
  "Last 30 days": "last_30d",
  "This month": "this_month",
}

// ── Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [showRangeMenu, setShowRangeMenu] = useState(false)

  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [ads, setAds] = useState<AdsResponse | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [loadingAds, setLoadingAds] = useState(true)

  const preset = DATE_PRESET[dateRange] ?? "last_30d"

  const loadData = useCallback(async () => {
    setLoadingInsights(true)
    setLoadingAds(true)

    const [insRes, adsRes] = await Promise.all([
      fetch(`/api/meta/insights?date_preset=${preset}`).then((r) => r.json() as Promise<InsightsResponse>),
      fetch(`/api/meta/ads?date_preset=${preset}`).then((r) => r.json() as Promise<AdsResponse>),
    ])

    setInsights(insRes)
    setAds(adsRes)
    setLoadingInsights(false)
    setLoadingAds(false)
  }, [preset])

  useEffect(() => { loadData() }, [loadData])

  const agg = insights?.data.aggregate
  const daily = insights?.data.daily ?? []
  const connected = insights?.connected ?? false

  // Build KPIs — use live data when available, else mock
  const kpis = [
    {
      title: "ROAS",
      value: agg ? `${agg.roas}x` : `${kpiData.roas}x`,
      delta: kpiData.roasDelta,
      icon: TrendingUp,
      iconColor: "text-cyan-400",
    },
    {
      title: "Revenue",
      value: agg ? formatINR(agg.revenue) : formatINR(kpiData.revenue),
      delta: kpiData.revenueDelta,
      icon: DollarSign,
      iconColor: "text-emerald-400",
    },
    {
      title: "Ad Spend",
      value: agg ? formatINR(agg.spend) : formatINR(kpiData.adSpend),
      delta: kpiData.adSpendDelta,
      icon: Target,
      iconColor: "text-blue-400",
    },
    {
      title: "Orders",
      value: kpiData.orders.toLocaleString("en-IN"),
      delta: kpiData.ordersDelta,
      icon: ShoppingBag,
      iconColor: "text-violet-400",
    },
    {
      title: "CAC",
      value: `₹${kpiData.cac}`,
      delta: kpiData.cacDelta,
      icon: Users,
      iconColor: "text-pink-400",
    },
    {
      title: "MER",
      value: `${kpiData.mer}x`,
      delta: kpiData.merDelta,
      icon: BarChart3,
      iconColor: "text-amber-400",
    },
  ]

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
            {insights?.source === "live" && (
              <span className="ml-2 text-xs text-emerald-400 font-medium">● Live</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range picker */}
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
            disabled={loadingInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCcw className={`w-4 h-4 ${loadingInsights ? "animate-spin" : ""}`} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/25 transition-all">
            <ArrowUpRight className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Connect banner (shown when not connected) */}
      {!loadingInsights && !connected && (
        <ConnectMetaBanner compact />
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {loadingInsights
          ? Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis.map((kpi, i) => <KPICard key={kpi.title} {...kpi} index={i} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {loadingInsights ? (
          <>
            <div className="xl:col-span-2"><ChartSkeleton height={240} /></div>
            <ChartSkeleton height={240} />
          </>
        ) : (
          <>
            {/* Revenue vs Spend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-2 rounded-xl border border-white/8 bg-white/3 p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-white">Revenue vs Ad Spend</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{dateRange}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Ad Spend
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={daily} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c4f0" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00c4f0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSpd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                    formatter={(v: number, name: string) => [`₹${(v / 100000).toFixed(1)}L`, name === "revenue" ? "Revenue" : "Ad Spend"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00c4f0" strokeWidth={2} fill="url(#gradRev)" dot={false} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fill="url(#gradSpd)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Daily Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-white/8 bg-white/3 p-5"
            >
              <div className="mb-5">
                <h2 className="font-semibold text-white">Daily Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">{dateRange}</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyOrdersData.slice(-14)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(v: number) => [v.toLocaleString(), "Orders"]}
                  />
                  <Bar dataKey="orders" fill="#00c4f0" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
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
              {ads?.source === "live" && (
                <span className="ml-1.5 text-emerald-400 font-medium">● Live</span>
              )}
            </p>
          </div>
          <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            View all →
          </button>
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
              {loadingAds
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : (ads?.data ?? []).map((ad, i) => (
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
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[ad.status] ?? statusColors["Paused"]}`}>
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
