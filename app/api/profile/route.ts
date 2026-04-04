import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return NextResponse.json({ profile: profile ?? null, user: { email: user.email } })
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const allowed: Record<string, unknown> = {}
  if (typeof body.name === "string") allowed.name = body.name
  if (typeof body.store_url === "string") allowed.store_url = body.store_url
  if (typeof body.onboarding_complete === "boolean") {
    allowed.onboarding_complete = body.onboarding_complete
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  // Upsert (profile may not exist yet for new OAuth users before trigger runs)
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, ...allowed })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
