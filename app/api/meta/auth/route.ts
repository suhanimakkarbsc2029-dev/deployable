import { NextResponse } from "next/server"

export async function GET() {
  const appId = process.env.META_APP_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!appId) {
    return NextResponse.json({ error: "META_APP_ID not configured" }, { status: 500 })
  }

  const redirectUri = `${appUrl}/api/meta/callback`

  const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth")
  oauthUrl.searchParams.set("client_id", appId)
  oauthUrl.searchParams.set("redirect_uri", redirectUri)
  oauthUrl.searchParams.set("scope", "ads_read,ads_management")
  oauthUrl.searchParams.set("response_type", "code")

  return NextResponse.redirect(oauthUrl.toString())
}
