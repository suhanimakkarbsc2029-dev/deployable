import { NextRequest, NextResponse } from "next/server"
import { fetchAccountInsights, fetchDailyInsights, isMetaConfigured } from "@/lib/meta"

export async function GET(request: NextRequest) {
  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"

  // Fetch both aggregate and daily in parallel
  const [aggregate, daily] = await Promise.all([
    fetchAccountInsights(datePreset),
    fetchDailyInsights(datePreset),
  ])

  return NextResponse.json({
    connected: isMetaConfigured(),
    source: aggregate.source,
    data: {
      aggregate: aggregate.data,
      daily: daily.data,
    },
    ...(aggregate.error ? { error: aggregate.error } : {}),
  })
}
