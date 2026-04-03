"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    monthlyPrice: 1999,
    annualPrice: 1599,
    description: "Perfect for early-stage brands just starting with paid ads.",
    limit: "Up to ₹10L monthly revenue",
    features: [
      "Meta Ads analytics",
      "Basic ROAS tracking",
      "Website funnel (up to 5 steps)",
      "First-party pixel",
      "Email support",
      "1 store connection",
      "30-day data history",
    ],
    cta: "Start free trial",
    highlight: false,
    badge: null,
  },
  {
    name: "Growth",
    monthlyPrice: 4999,
    annualPrice: 3999,
    description: "For scaling brands that need deeper insights and faster decisions.",
    limit: "Up to ₹50L monthly revenue",
    features: [
      "Everything in Starter",
      "AI Insights Engine",
      "Profit dashboard (with COGS)",
      "Creative performance analytics",
      "Lookalike audience insights",
      "3 store connections",
      "90-day data history",
      "Slack alerts",
      "Priority email support",
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Scale",
    monthlyPrice: 9999,
    annualPrice: 7999,
    description: "Enterprise-grade analytics for high-volume D2C operations.",
    limit: "Unlimited revenue",
    features: [
      "Everything in Growth",
      "Unlimited store connections",
      "Custom attribution windows",
      "API access",
      "White-label reports",
      "Dedicated success manager",
      "1-year data history",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Talk to sales",
    highlight: false,
    badge: null,
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            14-day free trial on all plans. No credit card required.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              Annual
              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-blue-600/5 shadow-xl shadow-cyan-500/10"
                  : "border-white/10 bg-white/3"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg">
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">
                    ₹{(annual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                {annual && (
                  <p className="text-xs text-emerald-400 font-medium">
                    Save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("en-IN")}/year
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">{plan.limit}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                    : "border border-white/15 text-white hover:border-white/30 hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
