"use client"

import { motion } from "framer-motion"
import {
  Globe, Users, ArrowUpRight, Clock, ShoppingCart, ArrowDownRight,
} from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { websiteKpis, funnelData, trafficSourceData } from "@/lib/mock-data"

const funnelColors = ["#00c4f0", "#22d3ee", "#38bdf8", "#60a5fa", "#818cf8"]

export default function WebsitePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Website Analytics</h1>
          <p className="text-sm text-slate-400">Last 30 days · Powered by first-party pixel</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Sessions",
            value: (websiteKpis.sessions / 1000).toFixed(0) + "K",
            delta: websiteKpis.sessionsDelta,
            icon: Users,
            color: "text-cyan-400",
          },
          {
            label: "Bounce Rate",
            value: `${websiteKpis.bounceRate}%`,
            delta: websiteKpis.bounceRateDelta,
            icon: ArrowDownRight,
            color: "text-amber-400",
            invertDelta: true,
          },
          {
            label: "Avg. Duration",
            value: websiteKpis.avgDuration,
            delta: websiteKpis.avgDurationDelta,
            icon: Clock,
            color: "text-blue-400",
          },
          {
            label: "Conversion Rate",
            value: `${websiteKpis.conversionRate}%`,
            delta: websiteKpis.conversionRateDelta,
            icon: ShoppingCart,
            color: "text-emerald-400",
          },
        ].map((kpi, i) => {
          const positive = kpi.invertDelta ? kpi.delta <= 0 : kpi.delta >= 0
          return (
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
              <p className="text-2xl font-black text-white mb-1">{kpi.value}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.delta > 0 ? "+" : ""}{kpi.delta}% vs last period
              </div>
            </motion.div>
          )
        })}
      </div>

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
          <p className="text-xs text-slate-500 mb-6">Drop-off analysis · Last 30 days</p>

          <div className="space-y-3">
            {funnelData.map((step, i) => {
              const prevPct = i > 0 ? funnelData[i - 1].pct : 100
              const dropOff = i > 0 ? ((prevPct - step.pct) / prevPct * 100).toFixed(0) : null

              return (
                <div key={step.stage}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: funnelColors[i] + "20", color: funnelColors[i] }}>
                        {i + 1}
                      </div>
                      <span className="font-medium text-white">{step.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-xs">{step.users.toLocaleString("en-IN")} users</span>
                      <span className="font-bold text-white w-12 text-right">{step.pct}%</span>
                    </div>
                  </div>
                  <div className="relative h-8 rounded-lg overflow-hidden bg-white/3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-lg"
                      style={{ background: `linear-gradient(90deg, ${funnelColors[i]}, ${funnelColors[i]}99)` }}
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

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={trafficSourceData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {trafficSourceData.map((entry, i) => (
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
            {trafficSourceData.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: source.color }} />
                  <span className="text-sm text-slate-300">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${source.value}%`, background: source.color }} />
                  </div>
                  <span className="text-sm font-semibold text-white w-8 text-right">{source.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
