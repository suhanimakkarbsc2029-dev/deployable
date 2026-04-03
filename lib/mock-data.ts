// Mock data for Deployable dashboard — Indian D2C ecommerce context

// Generate last 30 days of revenue vs ad spend
export const revenueVsSpendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const day = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  const spend = Math.round(15000 + Math.random() * 20000)
  const revenue = Math.round(spend * (2.1 + Math.random() * 1.4))
  return { date: day, spend, revenue }
})

// Daily orders
export const dailyOrdersData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const day = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  const orders = Math.round(120 + Math.random() * 180)
  return { date: day, orders }
})

// Top ads performance
export const topAdsData = [
  {
    id: 1,
    name: "Summer Glow — Video Ad",
    campaign: "Festive Collection",
    spend: 142500,
    revenue: 498750,
    roas: 3.5,
    ctr: 4.2,
    cpc: 18.5,
    impressions: 285000,
    clicks: 7700,
    status: "Active",
  },
  {
    id: 2,
    name: "New Arrivals — Carousel",
    campaign: "New Launch",
    spend: 98200,
    revenue: 363340,
    roas: 3.7,
    ctr: 3.8,
    cpc: 22.1,
    impressions: 198000,
    clicks: 4450,
    status: "Active",
  },
  {
    id: 3,
    name: "Retargeting — Cart Abandoners",
    campaign: "Retargeting",
    spend: 55000,
    revenue: 165000,
    roas: 3.0,
    ctr: 5.1,
    cpc: 14.2,
    impressions: 110000,
    clicks: 3870,
    status: "Active",
  },
  {
    id: 4,
    name: "Skincare Bundle — Static",
    campaign: "Bundle Offers",
    spend: 76800,
    revenue: 199680,
    roas: 2.6,
    ctr: 2.9,
    cpc: 28.4,
    impressions: 152000,
    clicks: 2705,
    status: "Paused",
  },
  {
    id: 5,
    name: "Loyalty Winback — DPA",
    campaign: "CRM Retargeting",
    spend: 32100,
    revenue: 80250,
    roas: 2.5,
    ctr: 3.3,
    cpc: 19.7,
    impressions: 68400,
    clicks: 1630,
    status: "Learning",
  },
]

// KPI summary
export const kpiData = {
  roas: 3.24,
  roasDelta: +12.4,
  revenue: 4825000,
  revenueDelta: +18.2,
  adSpend: 1489000,
  adSpendDelta: +5.1,
  orders: 3842,
  ordersDelta: +22.7,
  cac: 387,
  cacDelta: -8.3,
  mer: 2.9,
  merDelta: +6.5,
}

// Campaigns
export const campaignsData = [
  {
    id: 1,
    name: "Festive Collection 2024",
    objective: "Conversions",
    status: "Active",
    impressions: 1240000,
    clicks: 52080,
    ctr: 4.2,
    spend: 385000,
    revenue: 1347500,
    roas: 3.5,
    budget: 15000,
  },
  {
    id: 2,
    name: "New Product Launch — Serum",
    objective: "Conversions",
    status: "Active",
    impressions: 892000,
    clicks: 33896,
    ctr: 3.8,
    spend: 248000,
    revenue: 843200,
    roas: 3.4,
    budget: 12000,
  },
  {
    id: 3,
    name: "Retargeting — Cart & Viewers",
    objective: "Conversions",
    status: "Active",
    impressions: 412000,
    clicks: 21824,
    ctr: 5.3,
    spend: 118000,
    revenue: 448400,
    roas: 3.8,
    budget: 8000,
  },
  {
    id: 4,
    name: "Brand Awareness — Video",
    objective: "Reach",
    status: "Paused",
    impressions: 2180000,
    clicks: 21800,
    ctr: 1.0,
    spend: 195000,
    revenue: 312000,
    roas: 1.6,
    budget: 10000,
  },
  {
    id: 5,
    name: "Bundle Offers — BOGO",
    objective: "Conversions",
    status: "Learning",
    impressions: 280000,
    clicks: 9800,
    ctr: 3.5,
    spend: 78000,
    revenue: 218400,
    roas: 2.8,
    budget: 6000,
  },
  {
    id: 6,
    name: "Lookalike — Top Buyers",
    objective: "Conversions",
    status: "Active",
    impressions: 650000,
    clicks: 19500,
    ctr: 3.0,
    spend: 168000,
    revenue: 537600,
    roas: 3.2,
    budget: 9000,
  },
]

// Website analytics
export const websiteKpis = {
  sessions: 182400,
  sessionsDelta: +14.2,
  bounceRate: 38.4,
  bounceRateDelta: -3.1,
  avgDuration: "2m 48s",
  avgDurationDelta: +8.7,
  conversionRate: 2.1,
  conversionRateDelta: +0.4,
}

export const funnelData = [
  { stage: "Visited", users: 182400, pct: 100 },
  { stage: "Product Viewed", users: 109440, pct: 60 },
  { stage: "Add to Cart", users: 43776, pct: 24 },
  { stage: "Checkout", users: 15298, pct: 8.4 },
  { stage: "Purchased", users: 3830, pct: 2.1 },
]

export const trafficSourceData = [
  { name: "Paid Social", value: 48, color: "#00c4f0" },
  { name: "Organic Search", value: 22, color: "#60a5fa" },
  { name: "Direct", value: 15, color: "#818cf8" },
  { name: "Email", value: 9, color: "#34d399" },
  { name: "Others", value: 6, color: "#f59e0b" },
]

// AI Insights
export const insightsData = [
  {
    id: 1,
    severity: "Critical",
    icon: "AlertTriangle",
    title: "Creative fatigue on 'Summer Sale' campaign",
    description:
      "CTR has dropped 41% over the last 7 days on your top-spend campaign. Frequency is now 8.2 — your audience has seen these creatives too many times. Refresh creatives immediately to stop ROAS bleeding.",
    metric: "CTR ↓ 41%",
    action: "Refresh Creatives",
  },
  {
    id: 2,
    severity: "Critical",
    icon: "ShoppingCart",
    title: "Cart abandonment spiked to 72% in last 48 hours",
    description:
      "Your cart-to-checkout rate fell from 35% to 28% — a 20% drop in 48 hours. This is likely a checkout friction issue. Check if your payment gateway is working on mobile. Estimated revenue impact: ₹1.8L/day.",
    metric: "72% abandonment",
    action: "Audit Checkout",
  },
  {
    id: 3,
    severity: "Warning",
    icon: "TrendingDown",
    title: "Retargeting ROAS dropped 34% — audience saturation",
    description:
      "Your retargeting campaigns are showing declining returns. Audience overlap is at 67% and frequency hit 12.4. Consider expanding to Lookalike audiences or refreshing the retargeting window from 14 to 7 days.",
    metric: "ROAS ↓ 34%",
    action: "Expand Audience",
  },
  {
    id: 4,
    severity: "Opportunity",
    icon: "TrendingUp",
    title: "Scale 'New Arrivals Video' budget by 20%",
    description:
      "Your 'New Arrivals Video' ad has maintained a 3.7x ROAS for 12 consecutive days with frequency under 3. It's in a sweet spot — increasing budget by ₹5K/day could generate an additional ₹18K+ revenue daily.",
    metric: "3.7x ROAS",
    action: "Scale Budget",
  },
  {
    id: 5,
    severity: "Warning",
    icon: "Smartphone",
    title: "Mobile conversion rate 2x lower than desktop",
    description:
      "Desktop CVR is 3.8% vs mobile CVR of 1.6%. 74% of your traffic is on mobile. Fixing mobile UX could double your overall conversions. Run Hotjar on mobile to identify friction points in the checkout flow.",
    metric: "Mobile CVR 1.6%",
    action: "Review Mobile UX",
  },
]
