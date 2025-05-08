"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Bell, Lock, CreditCard } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const settingsNavItems = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Notifications", href: "/settings/notifications", icon: Bell },
    { name: "Security", href: "/settings/security", icon: Lock },
    { name: "Billing", href: "/settings/billing", icon: CreditCard },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        {settingsNavItems.map((item) => (
          <Button
            key={item.name}
            variant={pathname === item.href ? "default" : "ghost"}
            className="justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
    </aside>
  )
}

// Add the named export SettingsSidebar that points to the Sidebar component
export const SettingsSidebar = Sidebar
