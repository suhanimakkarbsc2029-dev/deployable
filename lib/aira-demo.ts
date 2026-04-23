import type { AccountInsights, DailyInsight, MetaAd } from "@/lib/meta"
import type { DashboardAnalysis } from "@/app/api/analysis/route"

// Realistic demo data for Aira — an Indian D2C jewellery brand
// Shown on the dashboard when Meta Ads is not connected

export const AIRA_AGGREGATE: AccountInsights = {
  impressions: 1_840_000,
  clicks: 25_760,
  spend: 748_500,
  revenue: 2_395_200,
  roas: 3.2,
  ctr: 1.4,
}

export const AIRA_ORDERS = 182

export const AIRA_DAILY: DailyInsight[] = (() => {
  const baseRevenue = [
    62000, 58000, 71000, 83000, 76000, 91000, 68000,
    54000, 79000, 88000, 95000, 74000, 61000, 82000,
    70000, 65000, 93000, 105000, 88000, 72000, 66000,
    84000, 97000, 112000, 89000, 75000, 68000, 91000,
    103000, 98000,
  ]
  const now = new Date()
  return baseRevenue.map((rev, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: rev,
      spend: Math.round(rev / 3.2),
    }
  })
})()

export const AIRA_ADS: MetaAd[] = [
  {
    id: "aira_ad_1",
    name: "Aira Kundan Bridal Collection — Video",
    campaign: "Bridal 2025",
    spend: 198400,
    revenue: 714200,
    roas: 3.6,
    ctr: 1.82,
    cpc: 27,
    status: "Active",
    impressions: 424000,
    clicks: 7348,
  },
  {
    id: "aira_ad_2",
    name: "Aira Polki Earrings — Carousel",
    campaign: "Everyday Wear",
    spend: 142600,
    revenue: 469600,
    roas: 3.3,
    ctr: 1.61,
    cpc: 31,
    status: "Active",
    impressions: 287000,
    clicks: 4600,
  },
  {
    id: "aira_ad_3",
    name: "Aira Gold Plated Necklace — Single Image",
    campaign: "Everyday Wear",
    spend: 115200,
    revenue: 299500,
    roas: 2.6,
    ctr: 1.10,
    cpc: 38,
    status: "Learning",
    impressions: 312000,
    clicks: 3032,
  },
  {
    id: "aira_ad_4",
    name: "Aira Temple Jewellery — Video",
    campaign: "Festive Specials",
    spend: 168300,
    revenue: 571400,
    roas: 3.4,
    ctr: 1.75,
    cpc: 29,
    status: "Active",
    impressions: 391000,
    clicks: 5803,
  },
  {
    id: "aira_ad_5",
    name: "Aira Festive Choker Set — Carousel",
    campaign: "Festive Specials",
    spend: 124000,
    revenue: 340500,
    roas: 2.7,
    ctr: 1.24,
    cpc: 34,
    status: "Active",
    impressions: 426000,
    clicks: 3647,
  },
]

export const AIRA_ANALYSIS: DashboardAnalysis = {
  overallHealthScore: 42,
  summary:
    "Aira's Meta campaigns are driving strong top-of-funnel reach but heavy cart abandonment and weak mobile CVR are eroding returns. Fixing the top 3 issues could push overall CVR from 1.1% to 3.3%.",
  currentCvr: 1.1,
  projectedCvrIfAllFixed: 3.3,
  problems: [
    {
      id: "cart_abandon",
      title: "High Cart Abandonment Rate",
      description:
        "78% of shoppers adding jewellery to cart are leaving without purchasing — well above the 65% industry norm. Likely causes: no EMI/instalment nudge, no trust badge at checkout, and cart timeout without a recovery email.",
      severity: "Critical",
      metricAffected: "Cart Abandonment",
      currentValue: "78%",
      benchmarkValue: "65%",
      predictedLift: 0.8,
      projectedCvr: 1.9,
      fixCheckKey: "cartAbandonmentRate",
      fixCheckThreshold: 65,
      fixCheckDirection: "below",
      fixHint: "Add cart recovery email, show EMI options and trust seals at checkout",
    },
    {
      id: "mobile_cvr",
      title: "Low Mobile Conversion Rate",
      description:
        "Mobile drives 74% of sessions but converts at only 0.7% vs 1.5% on desktop. Image carousels load slowly on 4G and the checkout form has too many fields — both classic drop-off triggers for price-sensitive jewellery buyers.",
      severity: "Critical",
      metricAffected: "Mobile CVR",
      currentValue: "0.7%",
      benchmarkValue: "1.5%",
      predictedLift: 0.6,
      projectedCvr: 2.5,
      fixCheckKey: "conversionRate",
      fixCheckThreshold: 1.4,
      fixCheckDirection: "above",
      fixHint: "Compress product images, reduce checkout fields, enable Google Pay / UPI one-tap",
    },
    {
      id: "image_ad_ctr",
      title: "Weak CTR on Single-Image Ads",
      description:
        "Single-image creatives are getting 1.1% CTR — 48% below the 2.1% benchmark for jewellery. Video and carousel formats outperform by 40%+ in this category. Budget is still split 35% to static images.",
      severity: "Warning",
      metricAffected: "Ad CTR",
      currentValue: "1.1%",
      benchmarkValue: "2.1%",
      predictedLift: 0.5,
      projectedCvr: 3.0,
      fixCheckKey: "ctr",
      fixCheckThreshold: 1.8,
      fixCheckDirection: "above",
      fixHint: "Shift static image budget to video / carousel; test lifestyle-worn jewellery shots",
    },
    {
      id: "bounce_rate",
      title: "High Landing Page Bounce Rate",
      description:
        "68% of paid traffic bounces on the first page — indicating a mismatch between ad creative and landing page. Ad shows festive choker; landing page shows generic catalogue. Aligning ad-to-page messaging typically lifts session quality 20-30%.",
      severity: "Warning",
      metricAffected: "Bounce Rate",
      currentValue: "68%",
      benchmarkValue: "50%",
      predictedLift: 0.3,
      projectedCvr: 3.3,
      fixCheckKey: "bounceRate",
      fixCheckThreshold: 55,
      fixCheckDirection: "below",
      fixHint: "Create dedicated landing pages per ad campaign with matching product and copy",
    },
  ],
}
