import { NextRequest, NextResponse } from "next/server"
import { fetchAds, isMetaConfigured } from "@/lib/meta"
import { getMetaCreds } from "@/lib/integrations"

export async function GET(request: NextRequest) {
  const datePreset = request.nextUrl.searchParams.get("date_preset") ?? "last_30d"

  const userCreds = await getMetaCreds()
  const result = await fetchAds(datePreset, userCreds)

  return NextResponse.json({
    connected: isMetaConfigured(userCreds),
    source: result.source,
    data: result.data,
    ...(result.error ? { error: result.error } : {}),
  })
}
