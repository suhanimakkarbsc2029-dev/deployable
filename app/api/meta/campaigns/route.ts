import { NextRequest, NextResponse } from "next/server"
import { fetchCampaigns, isMetaConfigured } from "@/lib/meta"

export async function GET(request: NextRequest) {
  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"

  const result = await fetchCampaigns(datePreset)

  return NextResponse.json({
    connected: isMetaConfigured(),
    source: result.source,
    data: result.data,
    ...(result.error ? { error: result.error } : {}),
  })
}
