"use client"

/**
 * MetaBanner — shows the right status for every Meta connection state:
 *
 * 1. connected=false, isLive=false  → "Not connected" — connect prompt
 * 2. connected=true,  isLive=false  → "Credentials set but API failed" — error + reconnect
 * 3. connected=true,  isLive=true   → nothing (live indicator is in the page header)
 */

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
        <a
          href="/api/meta/auth"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-all whitespace-nowrap flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Reconnect Meta
        </a>
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
        <a href="/api/meta/auth" className="ml-auto text-xs text-amber-400 underline whitespace-nowrap hover:text-amber-300">
          Reconnect
        </a>
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
            Connect your Meta Ads account to see live campaigns and real ROAS.
          </p>
        </div>
      </div>
      <a
        href="/api/meta/auth"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877f2]/15 border border-[#1877f2]/30 text-[#4a9eff] text-sm font-semibold hover:bg-[#1877f2]/25 transition-all whitespace-nowrap flex-shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Connect Meta Ads
      </a>
    </div>
  )
}
