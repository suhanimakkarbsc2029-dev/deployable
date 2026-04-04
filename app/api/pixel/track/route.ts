import { NextRequest, NextResponse } from "next/server"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { site_id, event_type, anonymous_id, url, referrer, metadata } = body

    if (!site_id || !event_type || !anonymous_id) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400, headers: CORS })
    }

    // Lazy-import admin client so build doesn't fail when env var is missing
    let supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin")
      supabase = createAdminClient()
    } catch {
      // If service role key isn't set, accept the event silently so the pixel
      // doesn't break the user's website
      return NextResponse.json({ ok: true }, { headers: CORS })
    }

    // Validate site_id exists (prevents junk data)
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("site_id", site_id)
      .single()

    if (!site) {
      return NextResponse.json({ ok: false, error: "Invalid site_id" }, { status: 404, headers: CORS })
    }

    await supabase.from("events").insert({
      site_id,
      event_type,
      anonymous_id,
      url: url || null,
      referrer: referrer || null,
      metadata: metadata && typeof metadata === "object" ? metadata : {},
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error("Pixel track error:", err)
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS })
  }
}
