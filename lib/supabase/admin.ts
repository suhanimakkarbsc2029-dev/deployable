import { createClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client — bypasses Row Level Security.
 * Use ONLY in server-side API routes where user auth is not available
 * (e.g. the pixel tracking endpoint that accepts cross-origin requests).
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
