import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

// Shape Claude must return
export interface AIInsight {
  title: string
  description: string
  severity: "Critical" | "Warning" | "Opportunity"
  action: string
}

// Metrics payload sent from the client
interface MetricsPayload {
  metaConnected?: boolean
  pixelConnected?: boolean
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

function buildPrompt(metrics: MetricsPayload): string {
  const hasPixel = metrics.pixelConnected === true
  const hasMeta = metrics.metaConnected !== false

  const metaSection = hasMeta ? `
Meta Ads data (last 30 days):
- ROAS: ${metrics.roas}x
- Revenue: ₹${(metrics.revenue / 100000).toFixed(1)}L
- Ad Spend: ₹${(metrics.adSpend / 100000).toFixed(1)}L
- CTR: ${metrics.ctr}%
- CPC: ₹${metrics.cpc}
- Top campaign ROAS: ${metrics.topCampaignRoas}x
- Worst campaign ROAS: ${metrics.worstCampaignRoas}x` : ""

  const pixelSection = hasPixel ? `
Website pixel data (last 30 days):
- Orders: ${metrics.orders}
- CAC: ₹${metrics.cac}
- Bounce Rate: ${metrics.bounceRate}%
- Conversion Rate: ${metrics.conversionRate}%
- Cart Abandonment Rate: ${metrics.cartAbandonmentRate}%
- Funnel drop-offs:
  * Visit → Product View: ${metrics.funnelDropoffs.visitToProductView}% drop-off
  * Product View → Add to Cart: ${metrics.funnelDropoffs.productViewToCart}% drop-off
  * Add to Cart → Checkout: ${metrics.funnelDropoffs.cartToCheckout}% drop-off
  * Checkout → Purchase: ${metrics.funnelDropoffs.checkoutToPurchase}% drop-off
- Mobile CVR: ${metrics.mobileConversionRate}%
- Desktop CVR: ${metrics.desktopConversionRate}%` : `
Website pixel data: NOT AVAILABLE — do not generate insights about website behavior, bounce rate, CVR, funnel, or mobile vs desktop.`

  return `You are an expert ecommerce ads analyst for Indian D2C brands running Meta Ads.

Analyze ONLY the data sources that are available below. Do NOT invent or assume numbers for unavailable data sources.
${metaSection}
${pixelSection}

Return exactly 5 actionable insights as a valid JSON array. Be specific and reference exact numbers from the available data only. If a data source is not available, generate insights only from what is available — focus on Meta Ads performance, campaign strategy, creative refresh, budget allocation, and audience targeting.

Return ONLY a raw JSON array — no markdown, no code fences, no explanation. Each object must have exactly these fields:
- "title": short insight title (max 10 words)
- "description": 2-3 sentences explaining the issue with specific numbers and what it means for the business
- "severity": exactly one of "Critical", "Warning", or "Opportunity"
- "action": imperative phrase for the CTA button (3-5 words, e.g. "Refresh Ad Creatives")`
}

export async function POST(request: NextRequest) {
  let metrics: MetricsPayload
  try {
    metrics = await request.json() as MetricsPayload
  } catch {
    return NextResponse.json({ insights: [], source: "none", error: "Invalid request" })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ insights: [], source: "none", error: "ANTHROPIC_API_KEY not configured" })
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(metrics) }],
    })

    const textBlock = message.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ insights: [], source: "none", error: "No text in response" })
    }

    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: AIInsight[]
    try {
      parsed = JSON.parse(raw) as AIInsight[]
    } catch {
      return NextResponse.json({ insights: [], source: "none", error: "Failed to parse Claude response" })
    }

    const valid = parsed.filter(
      (i) =>
        typeof i.title === "string" &&
        typeof i.description === "string" &&
        ["Critical", "Warning", "Opportunity"].includes(i.severity) &&
        typeof i.action === "string"
    )

    return NextResponse.json({ insights: valid, source: "claude" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ insights: [], source: "none", error: msg })
  }
}
