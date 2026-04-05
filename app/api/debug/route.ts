import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const result: Record<string, unknown> = {}

  // 1. Env vars
  result.env = {
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN
      ? `set (${process.env.META_ACCESS_TOKEN.slice(0, 8)}…)`
      : "NOT SET",
    META_AD_ACCOUNT_ID: process.env.META_AD_ACCOUNT_ID
      ? `set (${process.env.META_AD_ACCOUNT_ID})`
      : "NOT SET",
    META_APP_ID: process.env.META_APP_ID ? "set" : "NOT SET",
    META_APP_SECRET: process.env.META_APP_SECRET ? "set" : "NOT SET",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY === "your_key_here"
      ? "PLACEHOLDER"
      : process.env.ANTHROPIC_API_KEY ? "set" : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "set"
      : "NOT SET",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "NOT SET",
  }

  // 2. Auth
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    result.auth = user
      ? { ok: true, id: user.id, email: user.email }
      : { ok: false, error: error?.message }
  } catch (e) {
    result.auth = { ok: false, error: String(e) }
  }

  // 3. Supabase tables
  try {
    const supabase = createClient()
    const tables = ["profiles", "integrations", "sites", "events"]
    const tableStatus: Record<string, string> = {}
    for (const t of tables) {
      const { error } = await supabase.from(t).select("id").limit(1)
      tableStatus[t] = error ? `ERROR: ${error.message}` : "exists"
    }
    result.tables = tableStatus
  } catch (e) {
    result.tables = { error: String(e) }
  }

  // 4. Test Meta API with env var token
  try {
    const token = process.env.META_ACCESS_TOKEN
    const accountId = process.env.META_AD_ACCOUNT_ID
    if (token && token !== "your_access_token" && accountId && accountId !== "your_ad_account_id") {
      const id = accountId.startsWith("act_") ? accountId : `act_${accountId}`
      const url = `https://graph.facebook.com/v20.0/${id}?fields=name,account_status&access_token=${token}`
      const res = await fetch(url)
      const data = await res.json()
      result.metaApiTest = {
        status: res.status,
        ok: res.ok,
        data: res.ok ? data : undefined,
        error: !res.ok ? data?.error?.message : undefined,
      }
    } else {
      result.metaApiTest = { skipped: "env vars not set or have placeholder values" }
    }
  } catch (e) {
    result.metaApiTest = { error: String(e) }
  }

  // 5. User's stored integration
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from("integrations")
        .select("provider, ad_account_id, updated_at")
        .eq("user_id", user.id)
      result.userIntegrations = error
        ? { error: error.message }
        : (data ?? [])
    } else {
      result.userIntegrations = "not authenticated"
    }
  } catch (e) {
    result.userIntegrations = { error: String(e) }
  }

  return NextResponse.json(result, { status: 200 })
}
