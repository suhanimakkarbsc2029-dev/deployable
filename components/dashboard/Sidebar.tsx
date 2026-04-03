"use client"

import { useState } from "react"
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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/dashboard/website", icon: Globe, label: "Website" },
  { href: "/dashboard/insights", icon: Lightbulb, label: "AI Insights" },
]

const bottomItems = [
  { href: "#", icon: Settings, label: "Settings" },
  { href: "#", icon: HelpCircle, label: "Help" },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
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
      <nav className="flex-1 p-3 space-y-1">
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

        {/* Collapsed logout — show as standalone button */}
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
