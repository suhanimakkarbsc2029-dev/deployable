"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Megaphone, ChevronDown, MousePointerClick, Target,
  TrendingUp, IndianRupee, Play, Pause, Zap, RefreshCcw,
} from "lucide-react"
import ConnectMetaBanner from "@/components/dashboard/ConnectMetaBanner"
import { CampaignCardSkeleton } from "@/components/dashboard/Skeletons"
import { formatINR } from "@/lib/utils"
import type { MetaCampaign } from "@/lib/meta"

interface CampaignsResponse {
  connected: boolean
  source: "live" | "mock"
  data: MetaCampaign[]
  error?: string
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Active: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Play },
  Paused: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Pause },
  Learning: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Zap },
}
const defaultStatus = statusConfig["Paused"]

const DATE_RANGES = ["Last 7 days", "Last 14 days", "Last 30 days", "This month"]
const DATE_PRESET: Record<string, string> = {
  "Last 7 days": "last_7d",
  "Last 14 days": "last_14d",
  "Last 30 days": "last_30d",
  "This month": "this_month",
}

export default function CampaignsPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [showDropdown, setShowDropdown] = useState(false)
  const [result, setResult] = useState<CampaignsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const preset = DATE_PRESET[dateRange] ?? "last_30d"

  const loadData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/meta/campaigns?date_preset=${preset}`)
    const json = await res.json() as CampaignsResponse
    setResult(json)
    setLoading(false)
  }, [preset])

  useEffect(() => { loadData() }, [loadData])

  const campaigns = result?.data ?? []
  const connected = result?.connected ?? false

  // Computed summary
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)
  const avgRoas = campaigns.length > 0
    ? (campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length).toFixed(1)
    : "—"
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Meta Campaigns</h1>
            <p className="text-sm text-slate-400">
              {loading ? "Loading…" : `${campaigns.length} campaigns`}
              {result?.source === "live" && (
                <span className="ml-2 text-xs text-emerald-400 font-medium">● Live</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Date filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/3"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {dateRange}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-11 w-44 rounded-xl border border-white/10 bg-[#0a1628] shadow-xl z-20 overflow-hidden">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${range === dateRange ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    onClick={() => { setDateRange(range); setShowDropdown(false) }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Connect banner */}
      {!loading && !connected && <ConnectMetaBanner compact />}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Spend", value: loading ? "—" : formatINR(totalSpend), icon: IndianRupee, color: "text-cyan-400" },
          { label: "Total Revenue", value: loading ? "—" : formatINR(totalRevenue), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg. ROAS", value: loading ? "—" : `${avgRoas}x`, icon: Target, color: "text-blue-400" },
          { label: "Total Clicks", value: loading ? "—" : totalClicks > 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : String(totalClicks), icon: MousePointerClick, color: "text-violet-400" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-white/8 bg-white/3 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
            {loading
              ? <div className="skeleton h-6 w-20 rounded" />
              : <p className="text-xl font-bold text-white">{item.value}</p>
            }
          </motion.div>
        ))}
      </div>

      {/* Campaigns grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CampaignCardSkeleton key={i} />)
          : campaigns.map((campaign, i) => {
              const status = statusConfig[campaign.status] ?? defaultStatus
              const StatusIcon = status.icon
              const budgetUsedPct = campaign.budget > 0
                ? Math.min(Math.round((campaign.spend / (campaign.budget * 30)) * 100), 100)
                : 78

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.07 }}
                  className="rounded-xl border border-white/8 bg-white/3 p-5 hover:border-white/15 hover:bg-white/5 transition-all duration-300 group"
                >
                  {/* Campaign header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-white text-sm leading-tight mb-1 truncate">{campaign.name}</p>
                      <p className="text-xs text-slate-500">{campaign.objective}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {campaign.status}
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Impressions", value: campaign.impressions > 1000 ? `${(campaign.impressions / 1000).toFixed(0)}K` : String(campaign.impressions) },
                      { label: "Clicks", value: campaign.clicks > 1000 ? `${(campaign.clicks / 1000).toFixed(1)}K` : String(campaign.clicks) },
                      { label: "CTR", value: `${campaign.ctr.toFixed(2)}%` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/3 rounded-lg p-2.5 text-center">
                        <p className="text-xs text-slate-500 mb-0.5">{m.label}</p>
                        <p className="text-sm font-bold text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Spend + Revenue + ROAS */}
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Spend / Revenue</p>
                      <p className="text-sm font-semibold text-white">
                        {formatINR(campaign.spend)}{" "}
                        <span className="text-slate-400">/</span>{" "}
                        <span className="text-emerald-400">{formatINR(campaign.revenue)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-0.5">ROAS</p>
                      <p className={`text-lg font-black ${campaign.roas >= 3 ? "text-emerald-400" : campaign.roas >= 2 ? "text-amber-400" : "text-red-400"}`}>
                        {campaign.roas > 0 ? `${campaign.roas}x` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Budget bar */}
                  {campaign.budget > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Budget utilisation</span>
                        <span>{budgetUsedPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${budgetUsedPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })
        }
      </div>

      {/* Empty state when no campaigns */}
      {!loading && campaigns.length === 0 && connected && (
        <div className="text-center py-16 text-slate-500">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No campaigns found for this date range.</p>
        </div>
      )}
    </div>
  )
}
