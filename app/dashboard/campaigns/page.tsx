"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Megaphone, ChevronDown, Eye, MousePointerClick, Target, TrendingUp, IndianRupee, Play, Pause, Zap } from "lucide-react"
import { campaignsData } from "@/lib/mock-data"
import { formatINR } from "@/lib/utils"

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Active: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Play },
  Paused: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Pause },
  Learning: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Zap },
}

const dateRanges = ["Last 7 days", "Last 14 days", "Last 30 days", "This month", "Custom"]

export default function CampaignsPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Meta Campaigns</h1>
            <p className="text-sm text-slate-400">All active and paused campaigns</p>
          </div>
        </div>

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
              {dateRanges.map((range) => (
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
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Spend", value: formatINR(campaignsData.reduce((s, c) => s + c.spend, 0)), icon: IndianRupee, color: "text-cyan-400" },
          { label: "Total Revenue", value: formatINR(campaignsData.reduce((s, c) => s + c.revenue, 0)), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg. ROAS", value: `${(campaignsData.reduce((s, c) => s + c.roas, 0) / campaignsData.length).toFixed(1)}x`, icon: Target, color: "text-blue-400" },
          { label: "Total Clicks", value: (campaignsData.reduce((s, c) => s + c.clicks, 0) / 1000).toFixed(0) + "K", icon: MousePointerClick, color: "text-violet-400" },
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
            <p className="text-xl font-bold text-white">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Campaigns grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {campaignsData.map((campaign, i) => {
          const status = statusConfig[campaign.status]
          const StatusIcon = status.icon
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
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
                  { label: "Impressions", value: (campaign.impressions / 1000).toFixed(0) + "K" },
                  { label: "Clicks", value: (campaign.clicks / 1000).toFixed(1) + "K" },
                  { label: "CTR", value: `${campaign.ctr}%` },
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
                    {formatINR(campaign.spend)} <span className="text-slate-400">/</span>{" "}
                    <span className="text-emerald-400">{formatINR(campaign.revenue)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-0.5">ROAS</p>
                  <p className={`text-lg font-black ${campaign.roas >= 3 ? "text-emerald-400" : campaign.roas >= 2 ? "text-amber-400" : "text-red-400"}`}>
                    {campaign.roas}x
                  </p>
                </div>
              </div>

              {/* Budget bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Daily budget used</span>
                  <span>₹{(campaign.budget * 0.78).toLocaleString()} / ₹{campaign.budget.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
