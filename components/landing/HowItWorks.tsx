"use client"

import { motion } from "framer-motion"
import { Link2, Code2, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect your Meta Ads account",
    description:
      "Authorize Deployable with one click via Meta's official OAuth. Your campaigns, creatives, and spend data sync instantly. Takes under 30 seconds.",
    badge: "OAuth · 30 seconds",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    number: "02",
    icon: Code2,
    title: "Install our pixel on your store",
    description:
      "Copy one line of code into your Shopify, WooCommerce, or custom store. Our server-side pixel starts tracking your visitors with 95%+ accuracy immediately.",
    badge: "One line of code",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    number: "03",
    icon: Zap,
    title: "Get insights. Scale with confidence.",
    description:
      "Within minutes, your unified dashboard is live. See true ROAS, funnel drop-offs, and AI recommendations. Make decisions based on reality, not guesswork.",
    badge: "Live in 5 minutes",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/3 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Live in <span className="gradient-text">5 minutes flat</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className={`rounded-2xl border ${step.bgColor} p-6 h-full`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${step.bgColor} border flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className={`text-4xl font-black opacity-20 ${step.color}`}>{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.description}</p>
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${step.color} px-3 py-1 rounded-full border ${step.bgColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {step.badge}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
