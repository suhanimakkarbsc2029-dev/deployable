"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Rocket, Eye, EyeOff, ArrowRight, Check, AlertCircle, MailCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const perks = [
  "No credit card required",
  "14-day free trial",
  "Cancel anytime",
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeUrl: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          store_url: form.storeUrl,
        },
        // emailRedirectTo tells Supabase where to send the user after they
        // click the confirmation link — must be an allowed redirect URL in
        // your Supabase project settings.
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "An account with this email already exists. Try signing in instead."
          : signUpError.message
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // --- Success state ---
  if (success) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
          <p className="text-slate-400 mb-2">
            We sent a confirmation link to{" "}
            <span className="text-white font-medium">{form.email}</span>
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Click the link in the email to activate your account and access your dashboard.
            It may take a minute or two to arrive.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white transition-all"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Deploy<span className="text-cyan-400">able</span>
            </span>
          </Link>
        </div>

        {/* Perks */}
        <div className="flex items-center justify-center gap-5 mb-7 flex-wrap">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {p}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Start your free trial</h1>
          <p className="text-slate-400 text-sm mb-8">
            14 days free, then from ₹1,999/month. No card needed.
          </p>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Arjun Mehta"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Work email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="arjun@nudgefit.in"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Store URL</label>
              <input
                type="url"
                name="storeUrl"
                value={form.storeUrl}
                onChange={handleChange}
                placeholder="https://yourstore.myshopify.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-sm disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Start your 14-day free trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              By creating an account you agree to our{" "}
              <a href="#" className="text-cyan-400 hover:underline">Terms</a> and{" "}
              <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
