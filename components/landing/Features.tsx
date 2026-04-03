"use client"

import { motion } from "framer-motion"
import { TrendingUp, BarChart2, Filter, Cpu, Shield, IndianRupee } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "True ROAS Tracking",
    description:
      "Move beyond last-click attribution. See the actual revenue driven by each ad, campaign, and creative — not what Meta claims.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    icon: BarChart2,
    title: "Meta Ads Analytics",
    description:
      "All your campaigns, ad sets, and creatives in one clean view. Spot winners, kill losers, and reallocate budget in seconds.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Filter,
    title: "Website Funnel Analysis",
    description:
      "Visualize every step from landing page to purchase. Find exactly where customers drop off and fix the leaks.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  {
    icon: Cpu,
    title: "AI Insights Engine",
    description:
      "Our AI monitors your data 24/7 and tells you exactly what's broken, what's scaling, and what to do next — no data science degree required.",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/20 text-pink-400",
  },
  {
    icon: Shield,
    title: "First-Party Pixel",
    description:
      "iOS 14 killed Meta's tracking. Our server-side pixel restores 95%+ signal accuracy so your algorithms optimize on real data.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  {
    icon: IndianRupee,
    title: "Profit Dashboard",
    description:
      "Revenue minus ad spend minus COGS in real time. Know your true margins, not just vanity metrics. Stop confusing revenue with profit.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20 text-amber-400",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text">scale profitably</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Built specifically for Indian D2C brands that run Meta Ads and want real answers, not more dashboards.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.color} p-6 hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
