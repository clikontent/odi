import type React from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <DashboardNav />
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

