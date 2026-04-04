import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Use this client in Server Components and Server Actions only.
 *
 * next/headers cookies() is READ-ONLY in Route Handlers — any cookie writes
 * are silently dropped. For Route Handlers that need to write cookies (e.g.
 * the OAuth callback), build the client inline using the Request/Response
 * objects directly, as done in app/auth/callback/route.ts.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — read-only, middleware handles
            // the session refresh so this is safe to ignore.
          }
        },
      },
    }
  )
}
