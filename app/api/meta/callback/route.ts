import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const oauthError = searchParams.get("error")

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? origin).trim()

  if (oauthError || !code) {
    return NextResponse.redirect(
      `${origin}/dashboard/campaigns?error=meta_oauth_denied`
    )
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = `${appUrl}/api/meta/callback`

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      `${origin}/dashboard/campaigns?error=meta_not_configured`
    )
  }

  try {
    // ── 1. Exchange authorization code for short-lived token ──────────────
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
    tokenUrl.searchParams.set("client_id", appId)
    tokenUrl.searchParams.set("client_secret", appSecret)
    tokenUrl.searchParams.set("redirect_uri", redirectUri)
    tokenUrl.searchParams.set("code", code)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message ?? "Token exchange failed")
    }

    const shortToken: string = tokenData.access_token

    // ── 2. Exchange for long-lived token (60-day) ─────────────────────────
    const longTokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token")
    longTokenUrl.searchParams.set("grant_type", "fb_exchange_token")
    longTokenUrl.searchParams.set("client_id", appId)
    longTokenUrl.searchParams.set("client_secret", appSecret)
    longTokenUrl.searchParams.set("fb_exchange_token", shortToken)

    const longTokenRes = await fetch(longTokenUrl.toString())
    const longTokenData = await longTokenRes.json()
    const accessToken: string = longTokenData.access_token ?? shortToken

    // ── 3. Fetch user's ad accounts to pick the first one ─────────────────
    const accountsUrl = new URL("https://graph.facebook.com/v18.0/me/adaccounts")
    accountsUrl.searchParams.set("access_token", accessToken)
    accountsUrl.searchParams.set("fields", "id,name,account_status")

    const accountsRes = await fetch(accountsUrl.toString())
    const accountsData = await accountsRes.json()
    const firstAccount = accountsData.data?.[0]
    const adAccountId: string | null = firstAccount?.id ?? null

    // ── 4. Save to Supabase integrations table ────────────────────────────
    // Build the redirect response first so we can write cookies onto it.
    const response = NextResponse.redirect(
      `${origin}/dashboard/campaigns?connected=true`
    )

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/login?redirectedFrom=/dashboard/campaigns`)
    }

    await supabase.from("integrations").upsert(
      {
        user_id: user.id,
        provider: "meta",
        access_token: accessToken,
        ad_account_id: adAccountId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    )

    return response
  } catch (err) {
    console.error("Meta OAuth callback error:", err)
    return NextResponse.redirect(
      `${origin}/dashboard/campaigns?error=meta_oauth_failed`
    )
  }
}
