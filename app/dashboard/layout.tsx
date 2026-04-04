import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/dashboard/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-suspenders — middleware already handles this, but just in case
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single()

  // Redirect to onboarding if profile is missing or incomplete
  if (!profile || profile.onboarding_complete === false) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen bg-[#050d1a]">
      <Sidebar />
      <div className="flex-1 min-w-0 md:ml-0 pt-14 md:pt-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}
