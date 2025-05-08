import type React from "react"
import { TopNavigation } from "@/components/top-navigation"
import { ClientPageViewTracker } from "@/components/client-page-view-tracker"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      <ClientPageViewTracker />
    </div>
  )
}
