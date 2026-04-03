"use client"

import { motion } from "framer-motion"
import { Megaphone, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react"

const steps = [
  "Go to developers.facebook.com and create a Meta App",
  "Add the Marketing API product to your app",
  "Generate a long-lived access token with ads_read permission",
  "Copy your Ad Account ID from Meta Ads Manager",
  "Add META_ACCESS_TOKEN and META_AD_ACCOUNT_ID to your .env.local",
]

interface Props {
  /** Show a compact inline version (for banners inside pages) */
  compact?: boolean
}

export default function ConnectMetaBanner({ compact = false }: Props) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">Showing demo data</p>
            <p className="text-xs text-slate-400">
              Connect your Meta Ads account to see real campaigns and performance.
            </p>
          </div>
        </div>
        <a
          href="https://developers.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
        >
          Connect
          <ExternalLink className="w-3 h-3" />
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-white/3 p-8 text-center max-w-2xl mx-auto"
    >
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-blue-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Connect your Meta Ads account</h3>
      <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
        Add your Meta API credentials to .env.local to see live campaign data,
        real ROAS, and actual ad performance. Takes about 5 minutes.
      </p>

      {/* Steps */}
      <div className="text-left space-y-2.5 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-slate-400 font-semibold">{i + 1}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {/* Code snippet */}
      <div className="rounded-xl border border-white/8 bg-[#071020] p-4 text-left mb-6 font-mono text-xs">
        <p className="text-slate-500 mb-2"># .env.local</p>
        <p>
          <span className="text-cyan-400">META_APP_ID</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">your_app_id</span>
        </p>
        <p>
          <span className="text-cyan-400">META_APP_SECRET</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">your_app_secret</span>
        </p>
        <p>
          <span className="text-cyan-400">META_ACCESS_TOKEN</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">EAAxxxxx...</span>
        </p>
        <p>
          <span className="text-cyan-400">META_AD_ACCOUNT_ID</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">act_123456789</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold hover:from-blue-400 hover:to-blue-600 transition-all"
        >
          Open Meta for Developers
          <ArrowRight className="w-4 h-4" />
        </a>
        <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-slate-500" />
          Currently showing demo data
        </div>
      </div>
    </motion.div>
  )
}
