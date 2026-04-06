import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function classifyReferrer(ref: string): string {
  if (!ref) return "Direct"
  const r = ref.toLowerCase()
  if (r.includes("facebook") || r.includes("instagram") || r.includes("fb.com")) return "Paid Social"
  if (r.includes("google")) return "Organic Search"
  if (r.includes("mail") || r.includes("substack") || r.includes("campaign-archive")) return "Email"
  if (r.includes("twitter") || r.includes("t.co") || r.includes("linkedin")) return "Social"
  return "Referral"
}

const SOURCE_COLORS: Record<string, string> = {
  "Paid Social": "#00c4f0",
  "Organic Search": "#60a5fa",
  Direct: "#818cf8",
  Email: "#34d399",
  Social: "#f472b6",
  Referral: "#f59e0b",
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get user's site
  const { data: site } = await supabase
    .from("sites")
    .select("site_id, name, domain")
    .eq("user_id", user.id)
    .single()

  if (!site) {
    return NextResponse.json({ hasPixel: false, siteId: null, data: null })
  }

  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"
  const days = datePreset === "last_7d" ? 7 : datePreset === "last_14d" ? 14 : 30

  const since = new Date()
  since.setDate(since.getDate() - days)

  // Check if pixel has ever fired (any events at all, not date-filtered)
  const { count: totalEverCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("site_id", site.site_id)

  const hasPixel = (totalEverCount ?? 0) > 0

  const { data: events } = await supabase
    .from("events")
    .select("event_type, anonymous_id, url, referrer, metadata, timestamp")
    .eq("site_id", site.site_id)
    .gte("timestamp", since.toISOString())
    .order("timestamp", { ascending: true })

  if (!events || events.length === 0) {
    return NextResponse.json({
      hasPixel,
      hasData: false,
      siteId: site.site_id,
      data: null,
    })
  }

  // ── Per-session aggregation ────────────────────────────────────────────────
  // session = unique anonymous_id
  const sessionEventTypes = new Map<string, Set<string>>()
  const sessionPageViews = new Map<string, number>()
  const referrerCounts: Record<string, number> = {}

  // Daily events
  const dailyOrders: Record<string, number> = {}
  const dailyPageViews: Record<string, number> = {}

  let totalRevenue = 0

  for (const ev of events) {
    const aid = ev.anonymous_id

    if (!sessionEventTypes.has(aid)) sessionEventTypes.set(aid, new Set())
    sessionEventTypes.get(aid)!.add(ev.event_type)

    if (ev.event_type === "page_view") {
      sessionPageViews.set(aid, (sessionPageViews.get(aid) || 0) + 1)

      // Traffic source
      const src = classifyReferrer(ev.referrer || "")
      referrerCounts[src] = (referrerCounts[src] || 0) + 1

      const day = new Date(ev.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      dailyPageViews[day] = (dailyPageViews[day] || 0) + 1
    }

    if (ev.event_type === "purchase") {
      const day = new Date(ev.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      dailyOrders[day] = (dailyOrders[day] || 0) + 1
      const val = Number(ev.metadata?.value ?? ev.metadata?.order_value ?? 0)
      totalRevenue += val
    }
  }

  const totalSessions = sessionEventTypes.size
  const bounceSessions = Array.from(sessionPageViews.values()).filter((n) => n <= 1).length
  const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 1000) / 10 : 0

  // Funnel — unique sessions reaching each stage
  const hasPV = (aid: string) => sessionEventTypes.get(aid)?.has("page_view") ?? false
  const hasProd = (aid: string) => sessionEventTypes.get(aid)?.has("product_view") ?? false
  const hasCart = (aid: string) => sessionEventTypes.get(aid)?.has("add_to_cart") ?? false
  const hasCheckout = (aid: string) => sessionEventTypes.get(aid)?.has("checkout_start") ?? false
  const hasPurchase = (aid: string) => sessionEventTypes.get(aid)?.has("purchase") ?? false

  const sessions = Array.from(sessionEventTypes.keys())
  const pvSessions = sessions.filter(hasPV).length
  const prodSessions = sessions.filter(hasProd).length
  const cartSessions = sessions.filter(hasCart).length
  const checkoutSessions = sessions.filter(hasCheckout).length
  const purchaseSessions = sessions.filter(hasPurchase).length

  const conversionRate =
    pvSessions > 0 ? Math.round((purchaseSessions / pvSessions) * 10000) / 100 : 0
  const cartAbandRate =
    cartSessions > 0
      ? Math.round(((cartSessions - purchaseSessions) / cartSessions) * 1000) / 10
      : 0

  const funnelData = [
    { stage: "Visited", users: pvSessions, pct: 100 },
    {
      stage: "Product Viewed",
      users: prodSessions,
      pct: pvSessions > 0 ? Math.round((prodSessions / pvSessions) * 1000) / 10 : 0,
    },
    {
      stage: "Add to Cart",
      users: cartSessions,
      pct: pvSessions > 0 ? Math.round((cartSessions / pvSessions) * 1000) / 10 : 0,
    },
    {
      stage: "Checkout",
      users: checkoutSessions,
      pct: pvSessions > 0 ? Math.round((checkoutSessions / pvSessions) * 1000) / 10 : 0,
    },
    { stage: "Purchased", users: purchaseSessions, pct: conversionRate },
  ]

  // Traffic sources
  const totalReferrals = Object.values(referrerCounts).reduce((a, b) => a + b, 0)
  const trafficSourceData = Object.entries(referrerCounts)
    .map(([name, count]) => ({
      name,
      value: totalReferrals > 0 ? Math.round((count / totalReferrals) * 100) : 0,
      color: SOURCE_COLORS[name] ?? "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Daily orders for chart
  const dailyOrdersArr = Object.entries(dailyOrders)
    .map(([date, orders]) => ({ date, orders }))

  // Daily pageviews for chart
  const dailyPageViewsArr = Object.entries(dailyPageViews)
    .map(([date, views]) => ({ date, views }))

  return NextResponse.json({
    hasPixel: true,
    hasData: true,
    siteId: site.site_id,
    data: {
      sessions: pvSessions,
      bounceRate,
      conversionRate,
      cartAbandonmentRate: cartAbandRate,
      orderCount: purchaseSessions,
      totalRevenue,
      funnel: funnelData,
      trafficSources: trafficSourceData,
      dailyOrders: dailyOrdersArr,
      dailyPageViews: dailyPageViewsArr,
      // for AI insights
      funnelDropoffs: {
        visitToProductView:
          pvSessions > 0 ? Math.round(((pvSessions - prodSessions) / pvSessions) * 100) : 0,
        productViewToCart:
          prodSessions > 0 ? Math.round(((prodSessions - cartSessions) / prodSessions) * 100) : 0,
        cartToCheckout:
          cartSessions > 0 ? Math.round(((cartSessions - checkoutSessions) / cartSessions) * 100) : 0,
        checkoutToPurchase:
          checkoutSessions > 0
            ? Math.round(((checkoutSessions - purchaseSessions) / checkoutSessions) * 100)
            : 0,
      },
    },
  })
}
