"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Globe, Users, ArrowUpRight, ShoppingCart, ArrowDownRight,
  Code2, Copy, Check, RefreshCcw, MousePointerClick,
} from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts"

interface FunnelStep {
  stage: string
  users: number
  pct: number
}
interface TrafficSource {
  name: string
  value: number
  color: string
}
interface StatsData {
  sessions: number
  bounceRate: number
  conversionRate: number
  cartAbandonmentRate: number
  orderCount: number
  totalRevenue: number
  funnel: FunnelStep[]
  trafficSources: TrafficSource[]
  dailyOrders: { date: string; orders: number }[]
  dailyPageViews: { date: string; views: number }[]
  funnelDropoffs: Record<string, number>
}
interface StatsResponse {
  hasPixel: boolean
  hasData: boolean
  siteId: string | null
  data: StatsData | null
}

const DATE_RANGES = ["Last 7 days", "Last 14 days", "Last 30 days"]
const DATE_PRESET: Record<string, string> = {
  "Last 7 days": "last_7d",
  "Last 14 days": "last_14d",
  "Last 30 days": "last_30d",
}

export default function WebsitePage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [copied, setCopied] = useState(false)

  const preset = DATE_PRESET[dateRange] ?? "last_30d"

  const appUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      : ""

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/website/stats?date_preset=${preset}`)
      const json = await res.json() as StatsResponse
      setStats(json)
    } catch {
      setStats({ hasPixel: false, hasData: false, siteId: null, data: null })
    }
    setLoading(false)
  }, [preset])

  useEffect(() => { loadStats() }, [loadStats])

  const pixelSnippet = stats?.siteId
    ? `<script src="${appUrl}/pixel.js?id=${stats.siteId}" async></script>`
    : ""

  async function copyPixel() {
    try {
      await navigator.clipboard.writeText(pixelSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  // ── Empty states ───────────────────────────────────────────────────────────

  if (!loading && stats && !stats.hasPixel) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Website Analytics</h1>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/3 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
            <Code2 className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Install the Pixel</h2>
          <p className="text-slate-400 text-sm mb-4 max-w-sm mx-auto leading-relaxed">
            Add one line of code to your store to track sessions, funnel drop-offs, and
            real orders.
          </p>
          <p className="text-xs text-slate-500">
            Go to <span className="text-cyan-400">Settings → Website Pixel</span> to get your install code.
          </p>
        </div>
      </div>
    )
  }

  if (!loading && stats && stats.hasPixel && !stats.hasData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Website Analytics</h1>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Pixel installed!</h2>
          <p className="text-slate-400 text-sm">
            No events in this date range yet. Visitors to your store will appear here automatically.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#071020] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-xs text-slate-500 font-mono">Your pixel snippet</span>
            <button onClick={copyPixel} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="w-3.5 h-3.5" />Copy</>}
            </button>
          </div>
          <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">{pixelSnippet}</pre>
        </div>
      </div>
    )
  }

  // ── Full analytics view ────────────────────────────────────────────────────

  const d = stats?.data
  const funnelColors = ["#00c4f0", "#22d3ee", "#38bdf8", "#60a5fa", "#818cf8"]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Website Analytics</h1>
            <p className="text-sm text-slate-400">
              {loading ? "Loading…" : `${dateRange} · First-party pixel`}
              {!loading && d && (
                <span className="ml-2 text-xs text-emerald-400 font-medium">● Live</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex gap-2">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${r === dateRange ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" : "text-slate-500 hover:text-white border-white/8 hover:border-white/15"}`}
              >
                {r.replace("Last ", "")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Sessions",
            value: loading ? "—" : d ? (d.sessions >= 1000 ? `${(d.sessions / 1000).toFixed(1)}K` : String(d.sessions)) : "—",
            icon: Users,
            color: "text-cyan-400",
          },
          {
            label: "Bounce Rate",
            value: loading ? "—" : d ? `${d.bounceRate}%` : "—",
            icon: ArrowDownRight,
            color: "text-amber-400",
          },
          {
            label: "Orders",
            value: loading ? "—" : d ? String(d.orderCount) : "—",
            icon: ShoppingCart,
            color: "text-emerald-400",
          },
          {
            label: "Conversion Rate",
            value: loading ? "—" : d ? `${d.conversionRate}%` : "—",
            icon: MousePointerClick,
            color: "text-blue-400",
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-white/8 bg-white/3 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            {loading ? (
              <div className="skeleton h-7 w-20 rounded" />
            ) : (
              <p className="text-2xl font-black text-white">{kpi.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sessions chart */}
      {d && d.dailyPageViews && d.dailyPageViews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/8 bg-white/3 p-5 mb-5"
        >
          <h2 className="font-semibold text-white mb-1">Daily Sessions</h2>
          <p className="text-xs text-slate-500 mb-5">{dateRange}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.dailyPageViews} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="gradPV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor((d.dailyPageViews.length - 1) / 6))} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => [v.toLocaleString(), "Sessions"]}
              />
              <Area type="monotone" dataKey="views" stroke="#818cf8" strokeWidth={2} fill="url(#gradPV)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Funnel + Traffic Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 rounded-xl border border-white/8 bg-white/3 p-6"
        >
          <h2 className="font-semibold text-white mb-1">Conversion Funnel</h2>
          <p className="text-xs text-slate-500 mb-6">
            {loading ? "Loading…" : "Drop-off analysis · unique sessions"}
          </p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : d ? (
            <div className="space-y-3">
              {d.funnel.map((step, i) => {
                const prevPct = i > 0 ? d.funnel[i - 1].pct : 100
                const dropOff =
                  i > 0 && prevPct > 0
                    ? ((prevPct - step.pct) / prevPct * 100).toFixed(0)
                    : null

                return (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: funnelColors[i] + "20", color: funnelColors[i] }}
                        >
                          {i + 1}
                        </div>
                        <span className="font-medium text-white">{step.stage}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-xs">
                          {step.users.toLocaleString("en-IN")} sessions
                        </span>
                        <span className="font-bold text-white w-12 text-right">{step.pct}%</span>
                      </div>
                    </div>
                    <div className="relative h-8 rounded-lg overflow-hidden bg-white/3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(step.pct, 100)}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-lg"
                        style={{
                          background: `linear-gradient(90deg, ${funnelColors[i]}, ${funnelColors[i]}99)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs text-white/80 font-medium">{step.stage}</span>
                      </div>
                    </div>
                    {dropOff && (
                      <div className="flex items-center gap-1.5 mt-1 ml-8">
                        <div className="w-px h-3 bg-red-400/40" />
                        <span className="text-xs text-red-400 font-medium">↓ {dropOff}% dropped off</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No funnel data.</p>
          )}
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 rounded-xl border border-white/8 bg-white/3 p-6"
        >
          <h2 className="font-semibold text-white mb-1">Traffic Sources</h2>
          <p className="text-xs text-slate-500 mb-4">Session breakdown by channel</p>

          {loading ? (
            <div className="space-y-2.5 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-6 rounded" />
              ))}
            </div>
          ) : d && d.trafficSources.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={d.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {d.trafficSources.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-2">
                {d.trafficSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: source.color }} />
                      <span className="text-sm text-slate-300">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${source.value}%`, background: source.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white w-8 text-right">
                        {source.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <ArrowUpRight className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No traffic source data yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
