import { NextResponse } from "next/server"
import { isMetaConfigured } from "@/lib/meta"
import { getMetaCreds } from "@/lib/integrations"

export async function GET() {
  const userCreds = await getMetaCreds()
  return NextResponse.json({
    connected: isMetaConfigured(userCreds),
    source: userCreds ? "user" : "env",
  })
}
