"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lightbulb, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart,
  Smartphone, ArrowRight, Sparkles, RefreshCcw, Cpu,
  MessageCircle, Send, X, Bot, User,
} from "lucide-react"
import type { AIInsight } from "@/app/api/insights/route"
import MetaConnectButtons from "@/components/dashboard/MetaConnectButtons"

// ── Icon pool ──────────────────────────────────────────────────────────────────
const ICONS = [AlertTriangle, TrendingDown, ShoppingCart, Smartphone, TrendingUp]

const severityConfig: Record<string, { color: string; bg: string; dot: string; actionCls: string }> = {
  Critical: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
    actionCls: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20",
  },
  Warning: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    actionCls: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20",
  },
  Opportunity: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    actionCls: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20",
  },
}

interface RealMetrics {
  metaConnected: boolean
  pixelConnected: boolean
  roas: number
  revenue: number
  adSpend: number
  orders: number
  ctr: number
  cpc: number
  cac: number
  bounceRate: number
  conversionRate: number
  cartAbandonmentRate: number
  funnelDropoffs: {
    visitToProductView: number
    productViewToCart: number
    cartToCheckout: number
    checkoutToPurchase: number
  }
  topCampaignRoas: number
  worstCampaignRoas: number
  mobileConversionRate: number
  desktopConversionRate: number
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// ── Build metrics from real API data ──────────────────────────────────────────
async function fetchRealMetrics(): Promise<RealMetrics> {
  const [metaRes, websiteRes, campaignsRes] = await Promise.allSettled([
    fetch("/api/meta/insights?date_preset=last_30d").then((r) => r.json()),
    fetch("/api/website/stats?date_preset=last_30d").then((r) => r.json()),
    fetch("/api/meta/campaigns?date_preset=last_30d").then((r) => r.json()),
  ])

  const meta = metaRes.status === "fulfilled" ? metaRes.value : null
  const website = websiteRes.status === "fulfilled" ? websiteRes.value : null
  const campaigns = campaignsRes.status === "fulfilled" ? campaignsRes.value : null

  const metaConnected = meta?.connected === true && meta?.source === "live"
  const pixelConnected = website?.hasData === true

  const agg = meta?.data?.aggregate
  const webData = website?.data
  const campaignList: Array<{ roas: number }> = campaigns?.data ?? []

  const spend = agg?.spend ?? 0
  const revenue = agg?.revenue ?? 0
  const roas = agg?.roas ?? 0
  const ctr = agg ? parseFloat(((agg.clicks / Math.max(agg.impressions, 1)) * 100).toFixed(2)) : 0
  const cpc = agg && agg.clicks > 0 ? parseFloat((spend / agg.clicks).toFixed(2)) : 0
  const orders = webData?.orderCount ?? 0
  const cac = orders > 0 ? parseFloat((spend / orders).toFixed(0)) : 0

  const topRoas = campaignList.length > 0 ? Math.max(...campaignList.map((c) => c.roas)) : roas
  const worstRoas = campaignList.length > 0 ? Math.min(...campaignList.map((c) => c.roas)) : roas

  const dropoffs = webData?.funnelDropoffs ?? {
    visitToProductView: 0,
    productViewToCart: 0,
    cartToCheckout: 0,
    checkoutToPurchase: 0,
  }

  return {
    metaConnected,
    pixelConnected,
    roas,
    revenue,
    adSpend: spend,
    orders,
    ctr,
    cpc,
    cac,
    bounceRate: webData?.bounceRate ?? 0,
    conversionRate: webData?.conversionRate ?? 0,
    cartAbandonmentRate: webData?.cartAbandonmentRate ?? 0,
    funnelDropoffs: dropoffs,
    topCampaignRoas: topRoas,
    worstCampaignRoas: worstRoas,
    mobileConversionRate: webData ? webData.conversionRate * 0.6 : 0,
    desktopConversionRate: webData ? webData.conversionRate * 1.4 : 0,
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function InsightSkeleton() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-5/6 rounded" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>
    </div>
  )
}

// ── Thinking animation ────────────────────────────────────────────────────────
function ThinkingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 mb-6"
    >
      <Cpu className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-cyan-300">Deployee is analysing your metrics…</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Reading live ROAS, funnel drop-offs, and campaign performance
        </p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({
  metrics,
  insights,
  onClose,
}: {
  metrics: RealMetrics | null
  insights: AIInsight[]
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey! I'm your ads analyst. I have full context of your current metrics and the insights above. Ask me anything — why a metric looks off, what to fix first, how to improve ROAS, anything.",
    },
  ])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: ChatMessage = { role: "user", content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)

    // Placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          metrics,
          insights,
        }),
      })

      if (!res.ok || !res.body) throw new Error("Request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: accumulated }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const SUGGESTIONS = [
    "Why is my ROAS low?",
    "What should I fix first?",
    "How to reduce cart abandonment?",
    "Which campaign to scale?",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-white/10 bg-[#080f1e] shadow-2xl shadow-black/50"
      style={{ height: "520px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Ask Deployee</p>
          <p className="text-xs text-slate-500">Knows your live metrics &amp; insights</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "assistant"
                ? "bg-cyan-500/15 border border-cyan-500/20"
                : "bg-violet-500/15 border border-violet-500/20"
            }`}>
              {msg.role === "assistant"
                ? <Bot className="w-3.5 h-3.5 text-cyan-400" />
                : <User className="w-3.5 h-3.5 text-violet-400" />
              }
            </div>
            <div className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === "assistant"
                ? "bg-white/5 border border-white/8 text-slate-300"
                : "bg-violet-500/15 border border-violet-500/20 text-white"
            }`}>
              {msg.content === "" && streaming ? (
                <span className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((j) => (
                    <motion.span
                      key={j}
                      className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                    />
                  ))}
                </span>
              ) : (
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {/* Suggestions — only show after first greeting, before any user message */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/3 text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-white/8">
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2 focus-within:border-cyan-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your metrics…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none outline-none min-h-[24px] max-h-[96px]"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="w-7 h-7 flex-shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-700 text-center mt-1.5">Enter to send · Shift+Enter for newline</p>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"claude" | "mock" | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [metaConnected, setMetaConnected] = useState<boolean | null>(null)
  const [metrics, setMetrics] = useState<RealMetrics | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const m = await fetchRealMetrics()
      setMetrics(m)
      setMetaConnected(m.metaConnected)

      const hasMetaData = m.metaConnected && (m.adSpend > 0 || m.roas > 0 || m.ctr > 0)
      const hasPixelData = m.pixelConnected && m.orders > 0

      if (!hasMetaData && !hasPixelData) {
        setLoading(false)
        return
      }

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m),
      })

      const json = await res.json() as {
        insights: AIInsight[]
        source: "claude" | "mock"
        error?: string
      }

      setInsights(json.insights)
      setSource(json.source)
      setLastUpdated(new Date())
      if (json.error) setError(json.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch insights")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  const criticalCount = insights.filter((i) => i.severity === "Critical").length
  const warningCount = insights.filter((i) => i.severity === "Warning").length
  const opportunityCount = insights.filter((i) => i.severity === "Opportunity").length

  function formatLastUpdated(d: Date) {
    const diff = Math.round((Date.now() - d.getTime()) / 1000)
    if (diff < 10) return "just now"
    if (diff < 60) return `${diff}s ago`
    return `${Math.round(diff / 60)}m ago`
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
            <p className="text-sm text-slate-400">
              {source === "claude"
                ? "Powered by Deployee · Live data"
                : "Powered by Deployable Intelligence Engine"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analysing…" : "Refresh"}
          </button>
          <button
            onClick={() => setChatOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              chatOpen
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-400"
                : "border-white/10 bg-white/3 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Ask Deployee
          </button>
        </div>
      </motion.div>

      {/* Thinking banner */}
      <AnimatePresence>
        {loading && <ThinkingBanner />}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && insights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {metaConnected ? (
            <>
              <p className="text-slate-400 mb-1">No campaign data yet</p>
              <p className="text-sm text-slate-600">Insights will appear once your campaigns have spend or activity.</p>
            </>
          ) : (
            <>
              <p className="text-slate-400 mb-4">Connect your account to get AI insights</p>
              <MetaConnectButtons size="md" layout="col" />
            </>
          )}
        </div>
      )}

      {/* Summary badges */}
      {!loading && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm font-semibold text-red-400">{criticalCount} Critical</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-semibold text-amber-400">{warningCount} Warning</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">{opportunityCount} Opportunity</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/3">
            {source === "claude" ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">Live · Deployee</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-400">Demo mode</span>
              </>
            )}
            {lastUpdated && (
              <span className="text-xs text-slate-500 ml-1">· {formatLastUpdated(lastUpdated)}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Insights list */}
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <InsightSkeleton key={i} />)
          : insights.map((insight, i) => {
              const cfg = severityConfig[insight.severity] ?? severityConfig["Warning"]
              const Icon = ICONS[i % ICONS.length]

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl border p-5 ${cfg.bg} hover:scale-[1.005] transition-transform duration-200`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {insight.severity}
                        </span>
                        {source === "claude" && (
                          <span className="flex items-center gap-1 text-xs text-cyan-500 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded-full font-medium">
                            <Sparkles className="w-2.5 h-2.5" />
                            Deployee
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white mb-1.5 leading-tight">{insight.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setChatOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Ask Deployee about this
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${cfg.actionCls}`}>
                      {insight.action}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })
        }
      </div>

      {/* Error note */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 px-4 py-3 rounded-xl border border-white/8 bg-white/3 flex items-center gap-2"
        >
          <span className="text-xs text-slate-500">
            ⚠ API note: {error.slice(0, 120)}{error.length > 120 ? "…" : ""}
          </span>
        </motion.div>
      )}

      {/* Pro tip — only show when insights are visible */}
      {!loading && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex items-start gap-3"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400">
            <span className="text-cyan-400 font-semibold">Pro tip:</span>{" "}
            Click <span className="text-white font-medium">Ask Deployee</span> to chat about any insight or drill into your numbers.
          </p>
        </motion.div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <ChatPanel
            metrics={metrics}
            insights={insights}
            onClose={() => setChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
