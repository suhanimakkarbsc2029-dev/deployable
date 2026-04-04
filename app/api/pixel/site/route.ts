import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch (or auto-create) the user's site
  let { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!site) {
    const { data: created } = await supabase
      .from("sites")
      .insert({ user_id: user.id, name: "My Store" })
      .select()
      .single()
    site = created
  }

  return NextResponse.json({ site })
}
