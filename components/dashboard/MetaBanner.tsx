"use client"

import MetaConnectButtons from "@/components/dashboard/MetaConnectButtons"

interface MetaBannerProps {
  connected: boolean
  isLive: boolean
  error?: string | null
}

export default function MetaBanner({ connected, isLive, error }: MetaBannerProps) {
  // Live — no banner needed
  if (isLive) return null

  // Connected but API failed (expired token, wrong account, permission error)
  if (connected && error) {
    const isExpired =
      error.toLowerCase().includes("expired") ||
      error.toLowerCase().includes("invalid") ||
      error.toLowerCase().includes("token") ||
      error.toLowerCase().includes("oauth")

    return (
      <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/8 p-4 flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-400">
              {isExpired ? "Meta token expired — reconnect to restore live data" : "Meta API error — showing demo data"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 break-words">
              {error.length > 180 ? error.slice(0, 180) + "…" : error}
            </p>
          </div>
        </div>
        <MetaConnectButtons size="sm" layout="col" />
      </div>
    )
  }

  // Connected but no error yet (API returned empty / no data — rare)
  if (connected && !isLive) {
    return (
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-400">
          Meta credentials found but no data returned yet. This can take a few minutes after first connection.
        </p>
        <MetaConnectButtons size="sm" layout="row" />
      </div>
    )
  }

  // Not connected at all
  return (
    <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-400">Showing demo data</p>
          <p className="text-xs text-slate-400">
            Connect your account to see live campaigns and real ROAS.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <MetaConnectButtons size="sm" layout="row" />
      </div>
    </div>
  )
}
