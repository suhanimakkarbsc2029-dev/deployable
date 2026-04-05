import Sidebar from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#050d1a]">
      <Sidebar />
      <div className="flex-1 min-w-0 md:ml-0 pt-14 md:pt-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}
