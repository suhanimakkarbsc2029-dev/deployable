import { NextRequest, NextResponse } from "next/server"
import { fetchAccountInsights, fetchDailyInsights, isMetaConfigured } from "@/lib/meta"
import { getMetaCreds } from "@/lib/integrations"

export async function GET(request: NextRequest) {
  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"

  const userCreds = await getMetaCreds()

  const [aggregate, daily] = await Promise.all([
    fetchAccountInsights(datePreset, userCreds),
    fetchDailyInsights(datePreset, userCreds),
  ])

  return NextResponse.json({
    connected: isMetaConfigured(userCreds),
    source: aggregate.source,
    data: {
      aggregate: aggregate.data,
      daily: daily.data,
    },
    ...(aggregate.error ? { error: aggregate.error } : {}),
  })
}
