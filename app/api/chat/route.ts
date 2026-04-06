import { NextRequest } from "next/server"
import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import type { AIInsight } from "@/app/api/insights/route"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  metrics: {
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
    topCampaignRoas: number
    worstCampaignRoas: number
  } | null
  insights: AIInsight[]
}

function buildSystemPrompt(req: ChatRequest): string {
  const { metrics, insights } = req

  const metricsBlock = metrics
    ? `
## Live Store Metrics (last 30 days)
${metrics.metaConnected
  ? `- ROAS: ${metrics.roas}x
- Revenue: ₹${(metrics.revenue / 100000).toFixed(1)}L
- Ad Spend: ₹${(metrics.adSpend / 100000).toFixed(1)}L
- CTR: ${metrics.ctr}%
- CPC: ₹${metrics.cpc}
- Top campaign ROAS: ${metrics.topCampaignRoas}x
- Worst campaign ROAS: ${metrics.worstCampaignRoas}x`
  : "Meta Ads: not connected"}
${metrics.pixelConnected
  ? `- Orders: ${metrics.orders}
- CAC: ₹${metrics.cac}
- Bounce Rate: ${metrics.bounceRate}%
- Conversion Rate: ${metrics.conversionRate}%
- Cart Abandonment Rate: ${metrics.cartAbandonmentRate}%`
  : "Website Pixel: not connected"}`
    : "\n## Live Store Metrics\nNo metrics available yet."

  const insightsBlock =
    insights.length > 0
      ? `\n## Current AI Insights\n${insights
          .map((ins, i) => `${i + 1}. [${ins.severity}] ${ins.title}\n   ${ins.description}`)
          .join("\n")}`
      : "\n## Current AI Insights\nNo insights generated yet."

  return `You are an expert ecommerce ads analyst embedded inside Deployable, a performance dashboard for Indian D2C brands running Meta Ads.

You have full context of this user's live store data and the AI-generated insights shown on their dashboard.
${metricsBlock}
${insightsBlock}

Your role:
- Answer any questions the user has about their metrics, campaigns, or the insights shown
- Give specific, data-driven advice referencing their actual numbers
- Be concise and actionable — this is a chat, not a report
- If they ask about something you don't have data for, say so honestly
- Use ₹ for currency, keep answers focused on Indian D2C context
- Do not repeat the full metrics back unless specifically asked`
}

export async function POST(request: NextRequest) {
  let body: ChatRequest
  try {
    body = await request.json() as ChatRequest
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: buildSystemPrompt(body),
    messages: body.messages,
    maxOutputTokens: 1024,
  })

  return result.toTextStreamResponse()
}
