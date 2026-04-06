import { NextRequest, NextResponse } from "next/server"
import { fetchAccountInsights, fetchDailyInsights, fetchAds, fetchCampaigns, isMetaConfigured } from "@/lib/meta"
import { getMetaCreds } from "@/lib/integrations"

export async function GET(request: NextRequest) {
  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"

  // Single Supabase auth call for all data
  const userCreds = await getMetaCreds()
  const connected = isMetaConfigured(userCreds)

  // All Meta API calls in parallel
  const [aggregate, daily, ads, campaigns] = await Promise.all([
    fetchAccountInsights(datePreset, userCreds),
    fetchDailyInsights(datePreset, userCreds),
    fetchAds(datePreset, userCreds),
    fetchCampaigns(datePreset, userCreds),
  ])

  const res = NextResponse.json({
    connected,
    source: aggregate.source,
    aggregate: aggregate.data,
    daily: daily.data,
    ads: ads.data,
    campaigns: campaigns.data,
    ...(aggregate.error ? { error: aggregate.error } : {}),
  })

  // Cache for 5 minutes on CDN/browser
  res.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=60")
  return res
}
