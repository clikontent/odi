import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <AdminNav />
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

