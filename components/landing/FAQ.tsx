"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Does it work with Shopify and WooCommerce?",
    a: "Yes — Deployable has native integrations with both Shopify and WooCommerce. For Shopify, install our app from the Shopify App Store in one click. For WooCommerce, we have a WordPress plugin or you can paste one snippet of JavaScript into your theme. We also support custom storefronts via our JavaScript SDK.",
  },
  {
    q: "How is this different from Meta Ads Manager?",
    a: "Meta Ads Manager only shows you what happens inside Meta — clicks, CPM, estimated conversions. Deployable shows you what actually happens on your website: real purchases, real revenue, real ROAS. We fix the iOS 14 attribution problem with our server-side pixel, connect your website funnel data, and give you AI-powered recommendations — none of which Meta does. Think of Meta Ads Manager as a telescope pointed at Meta. Deployable is the ground truth.",
  },
  {
    q: "What happens after the free trial?",
    a: "After your 14-day free trial, you'll be asked to select a plan. Your data and settings are fully preserved. If you don't upgrade, your account moves to a read-only mode for 30 days so you can export your data. We don't delete anything. No hidden fees, no auto-charge without notice.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We're SOC 2 Type II compliant and follow GDPR best practices. We never sell your data or use it to train third-party models. Your ad account credentials are handled via OAuth — we never store your Meta password. You can delete all your data at any time from settings.",
  },
  {
    q: "Do I need a developer to set it up?",
    a: "No. The average setup time is 5 minutes, done entirely by non-technical founders. Connecting Meta Ads is a 30-second OAuth flow. Installing the pixel on Shopify is a one-click app install. For WooCommerce, it's copying one line of code. Our onboarding wizard walks you through every step. If you get stuck, our support team will handle the technical setup for free on Growth and Scale plans.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Questions? <span className="gradient-text">Answered.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                open === i ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/8 bg-white/3"
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${open === i ? "bg-cyan-500 text-white" : "bg-white/8 text-slate-400"}`}>
                  {open === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
