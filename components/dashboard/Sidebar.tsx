"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  LayoutDashboard,
  Megaphone,
  Globe,
  Lightbulb,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Link2,
  Link2Off,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard/website", icon: Globe, label: "Website" },
  { href: "/dashboard/insights", icon: Lightbulb, label: "AI Insights" },
]

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: HelpCircle, label: "Help" },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [metaConnected, setMetaConnected] = useState<boolean | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch("/api/meta/status")
      .then((r) => r.json())
      .then((d) => setMetaConnected(d.connected))
      .catch(() => setMetaConnected(false))
  }, [pathname])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    await fetch("/api/meta/disconnect", { method: "DELETE" })
    setMetaConnected(false)
    setDisconnecting(false)
    router.refresh()
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-64" : collapsed ? "w-16" : "w-60"} transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 p-4 h-16 border-b border-white/5 ${collapsed && !mobile ? "justify-center px-2" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold text-white truncate"
          >
            Deploy<span className="text-cyan-400">able</span>
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              } ${collapsed && !mobile ? "justify-center px-2" : ""}`}
            >
              <item.icon
                className={`flex-shrink-0 ${active ? "text-cyan-400" : "text-slate-500 group-hover:text-white"}`}
                style={{ width: 18, height: 18 }}
              />
              {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
              {active && (!collapsed || mobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </Link>
          )
        })}

        {/* Connected Accounts section */}
        {(!collapsed || mobile) && (
          <div className="pt-4 pb-1">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Connected Accounts
            </p>
            <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
              {/* Meta Ads row */}
              <div className="flex items-center gap-2.5">
                {/* Meta icon */}
                <div className="w-7 h-7 rounded-lg bg-[#1877f2]/15 border border-[#1877f2]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white leading-none mb-0.5">Meta Ads</p>
                  {metaConnected === null ? (
                    <p className="text-[10px] text-slate-500">Checking…</p>
                  ) : metaConnected ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Connected
                    </span>
                  ) : (
                    <p className="text-[10px] text-slate-500">Not connected</p>
                  )}
                </div>
                {/* Connect / Disconnect button */}
                {metaConnected === false && (
                  <a
                    href="/api/meta/auth"
                    title="Connect Meta Ads"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all flex-shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </a>
                )}
                {metaConnected === true && (
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    title="Disconnect Meta Ads"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 disabled:opacity-50"
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed — show Meta icon only */}
        {collapsed && !mobile && metaConnected !== null && (
          <div className="flex justify-center pt-3">
            <div
              title={metaConnected ? "Meta Ads: Connected" : "Meta Ads: Not connected"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center relative ${
                metaConnected
                  ? "bg-[#1877f2]/15 border-[#1877f2]/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={metaConnected ? "#1877f2" : "#475569"}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {metaConnected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#071020]" />
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all ${collapsed && !mobile ? "justify-center px-2" : ""}`}
          >
            <item.icon style={{ width: 18, height: 18 }} className="flex-shrink-0 text-slate-500" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        ))}

        {/* User row + logout */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-2 ${collapsed && !mobile ? "justify-center px-2" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            AK
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Arjun Kumar</p>
              <p className="text-xs text-slate-500 truncate">arjun@brand.in</p>
            </div>
          )}
          {(!collapsed || mobile) && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {loggingOut ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogOut style={{ width: 15, height: 15 }} />
              )}
            </button>
          )}
        </div>

        {/* Collapsed logout */}
        {collapsed && !mobile && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {loggingOut ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <LogOut style={{ width: 18, height: 18 }} />
            )}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col relative bg-[#071020] border-r border-white/5 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#071020] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#071020] border-b border-white/5 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-white">
            Deploy<span className="text-cyan-400">able</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-400 hover:text-white p-1"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 bg-[#071020] border-r border-white/5 overflow-y-auto"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
