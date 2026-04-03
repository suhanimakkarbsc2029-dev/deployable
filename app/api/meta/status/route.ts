import { NextResponse } from "next/server"
import { isMetaConfigured } from "@/lib/meta"

export async function GET() {
  return NextResponse.json({ connected: isMetaConfigured() })
}
