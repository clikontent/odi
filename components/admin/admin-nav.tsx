"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Settings, Users } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function AdminNav() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: BarChart,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Templates",
      href: "/admin/templates",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                  <Link href={route.href}>
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

