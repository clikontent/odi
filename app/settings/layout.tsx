import type React from "react"
import { Sidebar } from "@/components/settings/sidebar"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  )
}

// Similar to the dashboard layout, make sure the settings layout
// doesn't duplicate the header

// If there's a header component being rendered in the settings layout,
// you might want to remove it or adjust it
