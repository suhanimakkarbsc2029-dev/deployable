"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const chartData = [
  { day: "Mar 1", revenue: 142000, spend: 44000 },
  { day: "Mar 5", revenue: 165000, spend: 48000 },
  { day: "Mar 9", revenue: 158000, spend: 52000 },
  { day: "Mar 13", revenue: 190000, spend: 55000 },
  { day: "Mar 17", revenue: 218000, spend: 58000 },
  { day: "Mar 21", revenue: 235000, spend: 61000 },
  { day: "Mar 25", revenue: 268000, spend: 65000 },
  { day: "Mar 29", revenue: 295000, spend: 68000 },
]

const kpiCards = [
  { label: "ROAS", value: "3.24x", delta: "+12%", positive: true },
  { label: "Revenue", value: "₹48.2L", delta: "+18%", positive: true },
  { label: "Ad Spend", value: "₹14.9L", delta: "+5%", positive: true },
  { label: "Orders", value: "3,842", delta: "+23%", positive: true },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Now in public beta — join 500+ D2C brands
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center tracking-tight leading-tight mb-6"
        >
          Stop guessing.{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text text-glow">Start scaling.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-center text-lg sm:text-xl text-slate-400 leading-relaxed mb-10"
        >
          Deployable connects your Meta Ads and website into one intelligent dashboard. See your true
          ROAS, fix leaking funnels, and know exactly what&apos;s making you money.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Link
            href="/signup"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-slate-300 font-medium text-base hover:border-white/30 hover:text-white transition-all backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
            Watch demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-slate-500 mb-16"
        >
          No credit card required &middot; 5 min setup &middot; Trusted by 500+ stores
        </motion.p>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Glow behind dashboard */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-blue-500/5 to-transparent rounded-2xl blur-xl -z-10 scale-105" />

          <div className="relative rounded-2xl border border-white/10 bg-[#0a1628] overflow-hidden shadow-2xl shadow-black/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#071020]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-xs mx-auto h-6 rounded-md bg-white/5 border border-white/5 flex items-center px-3">
                  <span className="text-xs text-slate-500">app.deployable.in/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {kpiCards.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="rounded-xl border border-white/8 bg-white/3 p-3.5"
                  >
                    <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-white">{kpi.value}</p>
                    <p className={`text-xs font-medium mt-0.5 ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                      {kpi.delta} vs last month
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main line chart */}
                <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-200">Revenue vs Ad Spend</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />Revenue</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Ad Spend</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00c4f0" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00c4f0" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                      <Tooltip
                        contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#94a3b8" }}
                        formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, ""]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00c4f0" strokeWidth={2} fill="url(#gradRevenue)" />
                      <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fill="url(#gradSpend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-sm font-semibold text-slate-200 mb-3">Daily Orders</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData.slice(-7)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#94a3b8" }}
                      />
                      <Bar dataKey="revenue" fill="#00c4f0" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
