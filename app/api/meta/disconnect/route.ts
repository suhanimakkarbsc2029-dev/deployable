import { NextResponse } from "next/server"
import { deleteIntegration } from "@/lib/integrations"

export async function DELETE() {
  try {
    await deleteIntegration("meta")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
