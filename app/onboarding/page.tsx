"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket, CheckCircle2, ArrowRight, Copy, Check,
  Megaphone, Code2, PartyPopper,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SiteData {
  site_id: string
  name: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [metaConnected, setMetaConnected] = useState(false)
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [copied, setCopied] = useState(false)
  const [completing, setCompleting] = useState(false)
  const router = useRouter()

  const appUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      : ""

  useEffect(() => {
    // Check if Meta already connected
    fetch("/api/meta/status")
      .then((r) => r.json())
      .then((d) => setMetaConnected(d.connected))
      .catch(() => {})

    // Fetch/create pixel site
    fetch("/api/pixel/site")
      .then((r) => r.json())
      .then((d) => { if (d.site) setSiteData(d.site) })
      .catch(() => {})
  }, [])

  // If user returns after OAuth, check connection status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "true") {
      setMetaConnected(true)
      setStep(2)
    }
  }, [])

  const pixelSnippet = siteData
    ? `<!-- Deployable Pixel -->
<script src="${appUrl}/pixel.js?id=${siteData.site_id}" async></script>`
    : "Loading…"

  async function copyPixel() {
    try {
      await navigator.clipboard.writeText(pixelSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  async function completeOnboarding() {
    setCompleting(true)
    try {
      // Mark onboarding_complete via API
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_complete: true }),
      })
    } catch { /* ignore */ }

    // Also update via Supabase client for immediate auth context refresh
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, onboarding_complete: true })
    }

    router.push("/dashboard")
  }

  const steps = [
    { num: 1, label: "Connect Meta Ads", icon: Megaphone },
    { num: 2, label: "Install Pixel", icon: Code2 },
    { num: 3, label: "You're all set", icon: PartyPopper },
  ]

  return (
    <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">
          Deploy<span className="text-cyan-400">able</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 ${
                step > s.num
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : step === s.num
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                  : "bg-white/5 border-white/10 text-slate-600"
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-px transition-all duration-500 ${step > s.num ? "bg-emerald-500/40" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#1877f2]/15 border border-[#1877f2]/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Connect Meta Ads</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Connect your Meta Ads account to see live campaign performance, ROAS, and
                AI-powered optimisation insights.
              </p>

              {metaConnected ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Meta Ads connected!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your campaigns will load automatically.</p>
                  </div>
                </div>
              ) : (
                <a
                  href="/api/meta/auth"
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-[#1877f2]/15 border border-[#1877f2]/30 text-[#4a9eff] font-semibold text-sm hover:bg-[#1877f2]/25 transition-all mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Meta
                </a>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/20 transition-all"
                >
                  Skip for now
                </button>
                {metaConnected && (
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur p-8">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-violet-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Install Pixel</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Add this one-line snippet to your store&apos;s{" "}
                <code className="text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded text-xs">&lt;head&gt;</code>{" "}
                to track sessions, funnels, and conversions.
              </p>

              {/* Pixel code box */}
              <div className="relative rounded-xl border border-white/10 bg-[#071020] mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <span className="text-xs text-slate-500 font-mono">HTML</span>
                  <button
                    onClick={copyPixel}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" />Copy</>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                  {pixelSnippet}
                </pre>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 mb-6">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track custom events like{" "}
                  <code className="text-cyan-400">add_to_cart</code>,{" "}
                  <code className="text-cyan-400">purchase</code> using{" "}
                  <code className="text-cyan-400">window.deployable.track(&apos;event&apos;, &#123; value: 999 &#125;)</code>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/20 transition-all"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 transition-all"
                >
                  Done <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <PartyPopper className="w-8 h-8 text-cyan-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-3">You&apos;re all set!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Your dashboard is ready. You can always connect more integrations from the Settings page.
              </p>

              {/* Summary */}
              <div className="space-y-2.5 mb-8 text-left">
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${metaConnected ? "bg-emerald-500/8 border-emerald-500/20" : "bg-white/3 border-white/8"}`}>
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${metaConnected ? "text-emerald-400" : "text-slate-600"}`} />
                  <span className={`text-sm ${metaConnected ? "text-white" : "text-slate-500"}`}>
                    Meta Ads {metaConnected ? "connected" : "— connect later from Settings"}
                  </span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${siteData ? "bg-emerald-500/8 border-emerald-500/20" : "bg-white/3 border-white/8"}`}>
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${siteData ? "text-emerald-400" : "text-slate-600"}`} />
                  <span className={`text-sm ${siteData ? "text-white" : "text-slate-500"}`}>
                    Pixel site created {siteData ? `(ID: ${siteData.site_id.slice(0, 8)}…)` : ""}
                  </span>
                </div>
              </div>

              <button
                onClick={completeOnboarding}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-cyan-500/20"
              >
                {completing ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
