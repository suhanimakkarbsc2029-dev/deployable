import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export interface ConversionProblem {
  id: string
  title: string
  description: string
  severity: "Critical" | "Warning"
  metricAffected: string
  currentValue: string
  benchmarkValue: string
  predictedLift: number
  projectedCvr: number
  fixCheckKey: string
  fixCheckThreshold: number
  fixCheckDirection: "above" | "below"
  fixHint: string
}

export interface DashboardAnalysis {
  overallHealthScore: number
  summary: string
  problems: ConversionProblem[]
  currentCvr: number
  projectedCvrIfAllFixed: number
}

interface AnalysisPayload {
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
  sessions: number
}

function buildPrompt(m: AnalysisPayload): string {
  const metaBlock = m.metaConnected ? `
Meta Ads (last 30 days):
- ROAS: ${m.roas}x | Spend: ₹${(m.adSpend / 100000).toFixed(1)}L | Revenue: ₹${(m.revenue / 100000).toFixed(1)}L
- CTR: ${m.ctr}% | CPC: ₹${m.cpc}
- Top campaign ROAS: ${m.topCampaignRoas}x | Worst: ${m.worstCampaignRoas}x` : "Meta Ads: not connected"

  const pixelBlock = m.pixelConnected ? `
Website Pixel (last 30 days):
- Sessions: ${m.sessions} | Orders: ${m.orders} | CVR: ${m.conversionRate}%
- Bounce Rate: ${m.bounceRate}% | Cart Abandonment: ${m.cartAbandonmentRate}%
- CAC: ₹${m.cac}
- Funnel drop-offs:
  * Visit → Product View: ${m.funnelDropoffs.visitToProductView}% drop-off
  * Product View → Add to Cart: ${m.funnelDropoffs.productViewToCart}% drop-off
  * Add to Cart → Checkout: ${m.funnelDropoffs.cartToCheckout}% drop-off
  * Checkout → Purchase: ${m.funnelDropoffs.checkoutToPurchase}% drop-off` : "Website Pixel: not connected"

  return `You are an expert ecommerce conversion analyst for Indian D2C brands.

Store data:
${metaBlock}
${pixelBlock}

Identify the top 3–4 conversion problems hurting this store. For each, predict the realistic CVR lift if fixed.

Return ONLY a raw JSON object — no markdown, no fences:
{
  "overallHealthScore": <integer 0-100 based on ROAS/CVR benchmarks for Indian D2C>,
  "summary": "<1 sentence: the single biggest bottleneck>",
  "currentCvr": <current CVR as float>,
  "projectedCvrIfAllFixed": <realistic projected CVR if all fixed — cap at 5%>,
  "problems": [
    {
      "id": "<snake_case id>",
      "title": "<problem title max 8 words>",
      "description": "<2 sentences: what's wrong and why it hurts conversions with exact numbers>",
      "severity": "<Critical or Warning>",
      "metricAffected": "<e.g. Cart Abandonment Rate>",
      "currentValue": "<e.g. 78%>",
      "benchmarkValue": "<Indian D2C benchmark e.g. <60%>",
      "predictedLift": <CVR percentage point lift if this one problem is fixed>,
      "projectedCvr": <currentCvr + predictedLift>,
      "fixCheckKey": "<one of: cartAbandonmentRate, bounceRate, conversionRate, ctr, roas, cpc, checkoutToPurchase, cartToCheckout, productViewToCart, visitToProductView>",
      "fixCheckThreshold": <threshold value that would indicate fixed>,
      "fixCheckDirection": "<above or below>",
      "fixHint": "<imperative 4-6 word action e.g. 'Add trust badges at checkout'>"
    }
  ]
}

Indian D2C benchmarks: CVR 1.5–2.5%, bounce rate <55%, cart abandonment <65%, CTR >1.5%, ROAS >2x.
Only include problems backed by the data. Raw JSON only.`
}

export async function POST(request: NextRequest) {
  let payload: AnalysisPayload
  try {
    payload = await request.json() as AnalysisPayload
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      maxOutputTokens: 1500,
      messages: [{ role: "user", content: buildPrompt(payload) }],
    })

    const raw = text.trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const analysis = JSON.parse(raw) as DashboardAnalysis
    return NextResponse.json(analysis)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
