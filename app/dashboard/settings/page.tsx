"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Settings, User, Link2, Link2Off, Copy, Check, AlertCircle,
  CheckCircle2, Code2, RefreshCcw, ExternalLink,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  name: string | null
  email: string | null
  store_url: string | null
  onboarding_complete: boolean
}

interface SiteData {
  site_id: string
  name: string
  domain: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [site, setSite] = useState<SiteData | null>(null)
  const [metaConnected, setMetaConnected] = useState<boolean | null>(null)
  const [pixelCopied, setPixelCopied] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [name, setName] = useState("")
  const [storeUrl, setStoreUrl] = useState("")
  const [loading, setLoading] = useState(true)

  const appUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      : ""

  const loadData = useCallback(async () => {
    setLoading(true)
    const [profileRes, siteRes, statusRes] = await Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/pixel/site").then((r) => r.json()),
      fetch("/api/meta/status").then((r) => r.json()),
    ])
    if (profileRes.profile) {
      setProfile(profileRes.profile)
      setName(profileRes.profile.name ?? "")
      setStoreUrl(profileRes.profile.store_url ?? "")
    }
    if (profileRes.user) setUserEmail(profileRes.user.email ?? "")
    if (siteRes.site) setSite(siteRes.site)
    setMetaConnected(statusRes.connected ?? false)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const pixelSnippet = site
    ? `<script src="${appUrl}/pixel.js?id=${site.site_id}" async></script>`
    : ""

  async function copyPixel() {
    try {
      await navigator.clipboard.writeText(pixelSnippet)
      setPixelCopied(true)
      setTimeout(() => setPixelCopied(false), 2000)
    } catch { /* ignore */ }
  }

  async function disconnect() {
    setDisconnecting(true)
    await fetch("/api/meta/disconnect", { method: "DELETE" })
    setMetaConnected(false)
    setDisconnecting(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, store_url: storeUrl }),
    })
    // Also update via supabase client
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, name, store_url: storeUrl })
    }
    setSaving(false)
    setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2000)
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="font-semibold text-white text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-500/15 border border-slate-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-400">Manage your account and integrations</p>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="Account">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-10 rounded-lg" />
                ))}
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-lg border border-white/8 bg-white/3 text-slate-400 text-sm">
                    <User className="w-4 h-4 mr-2.5 text-slate-600" />
                    {userEmail || profile?.email || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Display Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Store URL</label>
                  <input
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : saveOk ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Saved!</>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </form>
            )}
          </Section>
        </motion.div>

        {/* Integrations */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Integrations">
            <div className="space-y-4">
              {/* Meta Ads */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3">
                <div className="w-10 h-10 rounded-xl bg-[#1877f2]/15 border border-[#1877f2]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Meta Ads</p>
                  {metaConnected === null ? (
                    <p className="text-xs text-slate-500 mt-0.5">Checking…</p>
                  ) : metaConnected ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected — fetching live campaigns & ROAS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      Not connected — showing demo data
                    </span>
                  )}
                </div>
                {metaConnected ? (
                  <button
                    onClick={disconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <a
                    href="/api/meta/auth"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1877f2]/30 text-[#4a9eff] text-xs font-semibold hover:bg-[#1877f2]/15 transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Connect
                  </a>
                )}
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Website Pixel */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Website Pixel">
            {loading ? (
              <div className="skeleton h-24 rounded-xl" />
            ) : site ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Pixel Active</span>
                  </div>
                  <code className="text-xs text-slate-500 font-mono">
                    Site ID: {site.site_id}
                  </code>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    Add this snippet to your store&apos;s{" "}
                    <code className="text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded">&lt;head&gt;</code>:
                  </p>
                  <div className="relative rounded-xl border border-white/10 bg-[#071020] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs text-slate-500 font-mono">HTML</span>
                      </div>
                      <button
                        onClick={copyPixel}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {pixelCopied ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" />Copy code</>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                      {pixelSnippet}
                    </pre>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-blue-400 font-semibold">Custom events:</span>{" "}
                    <code className="text-cyan-400">window.deployable.track(&apos;purchase&apos;, &#123; value: 1299 &#125;)</code>
                    {" "}— track{" "}
                    <code className="text-cyan-400">product_view</code>,{" "}
                    <code className="text-cyan-400">add_to_cart</code>,{" "}
                    <code className="text-cyan-400">checkout_start</code>,{" "}
                    <code className="text-cyan-400">purchase</code>
                  </p>
                </div>

                {storeUrl && (
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open {storeUrl}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Pixel site not found. Try refreshing.</p>
            )}
          </Section>
        </motion.div>
      </div>
    </div>
  )
}
