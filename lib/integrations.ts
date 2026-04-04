/**
 * Supabase integrations table helpers.
 * Used by Route Handlers and Server Components to read/write per-user
 * third-party OAuth credentials.
 *
 * Table schema (run in Supabase SQL editor):
 *
 *   create table public.integrations (
 *     id           uuid primary key default gen_random_uuid(),
 *     user_id      uuid not null references auth.users(id) on delete cascade,
 *     provider     text not null,
 *     access_token text not null,
 *     ad_account_id text,
 *     created_at   timestamptz not null default now(),
 *     updated_at   timestamptz not null default now(),
 *     unique (user_id, provider)
 *   );
 *
 *   alter table public.integrations enable row level security;
 *
 *   create policy "Users can manage their own integrations"
 *     on public.integrations for all
 *     using (auth.uid() = user_id)
 *     with check (auth.uid() = user_id);
 */

import { createClient } from "@/lib/supabase/server"
import type { MetaCreds } from "@/lib/meta"

export interface Integration {
  id: string
  user_id: string
  provider: string
  access_token: string
  ad_account_id: string | null
  created_at: string
  updated_at: string
}

export async function getUserIntegration(provider: string): Promise<Integration | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", provider)
    .single()

  return data ?? null
}

export async function upsertIntegration(
  userId: string,
  provider: string,
  accessToken: string,
  adAccountId?: string | null
): Promise<void> {
  const supabase = createClient()
  await supabase.from("integrations").upsert(
    {
      user_id: userId,
      provider,
      access_token: accessToken,
      ad_account_id: adAccountId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  )
}

export async function deleteIntegration(provider: string): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  await supabase
    .from("integrations")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider)
}

/** Returns MetaCreds from the current user's stored integration, or null. */
export async function getMetaCreds(): Promise<MetaCreds | null> {
  const integration = await getUserIntegration("meta")
  if (!integration || !integration.ad_account_id) return null
  return {
    accessToken: integration.access_token,
    adAccountId: integration.ad_account_id,
  }
}
