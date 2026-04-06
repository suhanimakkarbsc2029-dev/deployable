/**
 * Meta Marketing API integration.
 * Uses the Meta Graph API v20.0 directly via fetch (server-side only).
 *
 * All functions accept an optional `creds` override so per-user OAuth tokens
 * stored in Supabase can be used instead of the global env-var token.
 *
 * Priority:  per-user creds  >  env-var token  >  mock data
 */

const BASE = "https://graph.facebook.com/v20.0"

// ─── Credential helpers ───────────────────────────────────────────────────────

export interface MetaCreds {
  accessToken: string
  adAccountId: string
}

function envCreds(): MetaCreds | null {
  const t = process.env.META_ACCESS_TOKEN
  const a = process.env.META_AD_ACCOUNT_ID
  if (!t || !a) return null
  return { accessToken: t, adAccountId: a }
}

function normAccountId(raw: string): string {
  return raw.startsWith("act_") ? raw : `act_${raw}`
}

/** True when either env vars or explicit creds are available */
export function isMetaConfigured(creds?: MetaCreds | null): boolean {
  return Boolean(creds ?? envCreds())
}

// ─── Graph API fetch ──────────────────────────────────────────────────────────

function toDatePreset(range: string): string {
  const map: Record<string, string> = {
    last_7d: "last_7d",
    last_14d: "last_14d",
    last_30d: "last_30d",
    this_month: "this_month",
    last_month: "last_month",
    "Last 7 days": "last_7d",
    "Last 14 days": "last_14d",
    "Last 30 days": "last_30d",
    "This month": "this_month",
  }
  return map[range] ?? "last_30d"
}

function actionValue(
  arr: Array<{ action_type: string; value: string }> | undefined,
  type: string
): number {
  return parseFloat(arr?.find((a) => a.action_type === type)?.value ?? "0")
}

async function graphGet<T>(
  path: string,
  params: Record<string, string>,
  creds: MetaCreds
): Promise<T> {
  const url = new URL(`${BASE}/${path}`)
  url.searchParams.set("access_token", creds.accessToken)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Meta API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

// ─── Raw Meta API types ───────────────────────────────────────────────────────

interface MetaInsightRecord {
  date_start: string
  date_stop: string
  spend: string
  impressions: string
  clicks: string
  ctr: string
  actions?: Array<{ action_type: string; value: string }>
  action_values?: Array<{ action_type: string; value: string }>
}

interface MetaCampaignRaw {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  insights?: { data: MetaInsightRecord[] }
}

interface MetaAdRaw {
  id: string
  name: string
  status: string
  campaign_id: string
  campaign?: { name: string }
  insights?: { data: MetaInsightRecord[] }
}

// ─── Exported types ───────────────────────────────────────────────────────────

export interface MetaCampaign {
  id: string
  name: string
  status: "Active" | "Paused" | "Learning" | string
  objective: string
  spend: number
  revenue: number
  roas: number
  impressions: number
  clicks: number
  ctr: number
  budget: number
}

export interface MetaAd {
  id: string | number
  name: string
  campaign: string
  spend: number
  revenue: number
  roas: number
  ctr: number
  cpc: number
  impressions: number
  clicks: number
  status: string
}

export interface AccountInsights {
  spend: number
  revenue: number
  roas: number
  impressions: number
  clicks: number
  ctr: number
}

export interface DailyInsight {
  date: string
  spend: number
  revenue: number
}

// ─── API functions (all accept optional creds override) ───────────────────────

export async function fetchCampaigns(
  datePreset = "last_30d",
  overrideCreds?: MetaCreds | null
): Promise<{ data: MetaCampaign[]; source: "live" | "mock"; error?: string }> {
  const creds = overrideCreds ?? envCreds()
  if (!creds) return { data: [], source: "mock" }

  try {
    const preset = toDatePreset(datePreset)
    const insightFields = "spend,impressions,clicks,ctr,actions,action_values"
    const fields = `id,name,status,objective,daily_budget,insights.date_preset(${preset}){${insightFields}}`

    const res = await graphGet<{ data: MetaCampaignRaw[] }>(
      `${normAccountId(creds.adAccountId)}/campaigns`,
      { fields, limit: "50" },
      creds
    )

    const data: MetaCampaign[] = res.data.map((c) => {
      const ins = c.insights?.data?.[0]
      const spend = parseFloat(ins?.spend ?? "0")
      const revenue = actionValue(ins?.action_values, "purchase")
      const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0
      const budget = parseFloat(c.daily_budget ?? c.lifetime_budget ?? "0") / 100

      return {
        id: c.id,
        name: c.name,
        status: normaliseStatus(c.status),
        objective: c.objective ?? "Conversions",
        spend,
        revenue,
        roas,
        impressions: parseInt(ins?.impressions ?? "0", 10),
        clicks: parseInt(ins?.clicks ?? "0", 10),
        ctr: parseFloat(ins?.ctr ?? "0"),
        budget,
      }
    })

    return { data, source: "live" }
  } catch (err) {
    return { data: [], source: "mock", error: String(err) }
  }
}

export async function fetchAccountInsights(
  datePreset = "last_30d",
  overrideCreds?: MetaCreds | null
): Promise<{ data: AccountInsights; source: "live" | "mock"; error?: string }> {
  const creds = overrideCreds ?? envCreds()
  const emptyInsights: AccountInsights = { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0 }
  if (!creds) return { data: emptyInsights, source: "mock" }

  try {
    const preset = toDatePreset(datePreset)
    const fields = "spend,impressions,clicks,ctr,actions,action_values"

    const res = await graphGet<{ data: MetaInsightRecord[] }>(
      `${normAccountId(creds.adAccountId)}/insights`,
      { fields, date_preset: preset },
      creds
    )

    const ins = res.data?.[0]
    if (!ins) return { data: emptyInsights, source: "live" }

    const spend = parseFloat(ins.spend ?? "0")
    const revenue = actionValue(ins.action_values, "purchase")

    return {
      data: {
        spend,
        revenue,
        roas: spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0,
        impressions: parseInt(ins.impressions ?? "0", 10),
        clicks: parseInt(ins.clicks ?? "0", 10),
        ctr: parseFloat(ins.ctr ?? "0"),
      },
      source: "live",
    }
  } catch (err) {
    return { data: emptyInsights, source: "mock", error: String(err) }
  }
}

export async function fetchDailyInsights(
  datePreset = "last_30d",
  overrideCreds?: MetaCreds | null
): Promise<{ data: DailyInsight[]; source: "live" | "mock"; error?: string }> {
  const creds = overrideCreds ?? envCreds()
  if (!creds) return { data: [], source: "mock" }

  try {
    const preset = toDatePreset(datePreset)
    const res = await graphGet<{ data: MetaInsightRecord[] }>(
      `${normAccountId(creds.adAccountId)}/insights`,
      { fields: "spend,action_values", date_preset: preset, time_increment: "1" },
      creds
    )

    const data: DailyInsight[] = res.data.map((ins) => {
      const d = new Date(ins.date_start)
      return {
        date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        spend: parseFloat(ins.spend ?? "0"),
        revenue: actionValue(ins.action_values, "purchase"),
      }
    })

    return { data, source: "live" }
  } catch (err) {
    return { data: [], source: "mock", error: String(err) }
  }
}

export async function fetchAds(
  datePreset = "last_30d",
  overrideCreds?: MetaCreds | null
): Promise<{ data: MetaAd[]; source: "live" | "mock"; error?: string }> {
  const creds = overrideCreds ?? envCreds()
  if (!creds) return { data: [], source: "mock" }

  try {
    const preset = toDatePreset(datePreset)
    const insightFields = "spend,impressions,clicks,ctr,cpc,actions,action_values"
    const fields = `id,name,status,campaign{name},insights.date_preset(${preset}){${insightFields}}`

    const res = await graphGet<{ data: MetaAdRaw[] }>(
      `${normAccountId(creds.adAccountId)}/ads`,
      { fields, limit: "50" },
      creds
    )

    const data: MetaAd[] = res.data.map((ad) => {
      const ins = ad.insights?.data?.[0]
      const spend = parseFloat(ins?.spend ?? "0")
      const revenue = actionValue(ins?.action_values, "purchase")

      return {
        id: ad.id,
        name: ad.name,
        campaign: ad.campaign?.name ?? "—",
        spend,
        revenue,
        roas: spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0,
        ctr: parseFloat(ins?.ctr ?? "0"),
        cpc: parseFloat((ins as unknown as Record<string, string>)?.cpc ?? "0"),
        impressions: parseInt(ins?.impressions ?? "0", 10),
        clicks: parseInt(ins?.clicks ?? "0", 10),
        status: normaliseStatus(ad.status),
      }
    })

    return { data, source: "live" }
  } catch (err) {
    return { data: [], source: "mock", error: String(err) }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseStatus(s: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    PAUSED: "Paused",
    CAMPAIGN_PAUSED: "Paused",
    IN_PROCESS: "Learning",
    WITH_ISSUES: "Paused",
    DELETED: "Paused",
    ARCHIVED: "Paused",
  }
  return map[s?.toUpperCase()] ?? s
}
