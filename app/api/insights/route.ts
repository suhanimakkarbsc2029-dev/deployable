import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { insightsData } from "@/lib/mock-data"

// Shape Claude must return
export interface AIInsight {
  title: string
  description: string
  severity: "Critical" | "Warning" | "Opportunity"
  action: string
}

// Metrics payload sent from the client
interface MetricsPayload {
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
  return `You are an expert ecommerce ads analyst for Indian D2C brands running Meta Ads.

Analyze these store metrics and return exactly 5 actionable insights as a valid JSON array. Be specific, data-driven, and direct. Reference exact numbers from the metrics.

Metrics:
- ROAS: ${metrics.roas}x
- Revenue (last 30 days): ₹${(metrics.revenue / 100000).toFixed(1)}L
- Ad Spend (last 30 days): ₹${(metrics.adSpend / 100000).toFixed(1)}L
- Orders: ${metrics.orders}
- CTR: ${metrics.ctr}%
- CPC: ₹${metrics.cpc}
- CAC: ₹${metrics.cac}
- Bounce Rate: ${metrics.bounceRate}%
- Conversion Rate: ${metrics.conversionRate}%
- Cart Abandonment Rate: ${metrics.cartAbandonmentRate}%
- Funnel drop-offs:
  * Visit → Product View: ${metrics.funnelDropoffs.visitToProductView}% drop-off
  * Product View → Add to Cart: ${metrics.funnelDropoffs.productViewToCart}% drop-off
  * Add to Cart → Checkout: ${metrics.funnelDropoffs.cartToCheckout}% drop-off
  * Checkout → Purchase: ${metrics.funnelDropoffs.checkoutToPurchase}% drop-off
- Top campaign ROAS: ${metrics.topCampaignRoas}x
- Worst campaign ROAS: ${metrics.worstCampaignRoas}x
- Mobile CVR: ${metrics.mobileConversionRate}%
- Desktop CVR: ${metrics.desktopConversionRate}%

Return ONLY a raw JSON array — no markdown, no code fences, no explanation. Each object must have exactly these fields:
- "title": short insight title (max 10 words)
- "description": 2-3 sentences explaining the issue with specific numbers and what it means for the business
- "severity": exactly one of "Critical", "Warning", or "Opportunity"
- "action": imperative phrase for the CTA button (3-5 words, e.g. "Refresh Ad Creatives")`
}

// Fallback: return mock insights shaped as AIInsight[]
function mockInsights(): AIInsight[] {
  return insightsData.map((d) => ({
    title: d.title,
    description: d.description,
    severity: d.severity as AIInsight["severity"],
    action: d.action,
  }))
}

export async function POST(request: NextRequest) {
  // Parse body — fall back gracefully if malformed
  let metrics: MetricsPayload
  try {
    metrics = await request.json() as MetricsPayload
  } catch {
    return NextResponse.json({ insights: mockInsights(), source: "mock" })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json({ insights: mockInsights(), source: "mock" })
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: buildPrompt(metrics),
        },
      ],
    })

    // Extract the text content block
    const textBlock = message.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ insights: mockInsights(), source: "mock", error: "No text in response" })
    }

    // Strip any accidental markdown fences Claude might include
    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: AIInsight[]
    try {
      parsed = JSON.parse(raw) as AIInsight[]
    } catch {
      return NextResponse.json({ insights: mockInsights(), source: "mock", error: "JSON parse failed" })
    }

    // Validate shape — discard malformed entries and fall back if fewer than 3 survive
    const valid = parsed.filter(
      (i) =>
        typeof i.title === "string" &&
        typeof i.description === "string" &&
        ["Critical", "Warning", "Opportunity"].includes(i.severity) &&
        typeof i.action === "string"
    )

    if (valid.length < 3) {
      return NextResponse.json({ insights: mockInsights(), source: "mock", error: "Insufficient valid insights" })
    }

    return NextResponse.json({ insights: valid, source: "claude" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ insights: mockInsights(), source: "mock", error: msg })
  }
}
