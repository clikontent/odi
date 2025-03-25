"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, FileText, LayoutDashboard, Mail, Settings, Star, User } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Resume Builder",
      href: "/dashboard/resume-builder",
      icon: FileText,
    },
    {
      title: "Cover Letter",
      href: "/dashboard/cover-letter",
      icon: Mail,
    },
    {
      title: "ATS Optimizer",
      href: "/dashboard/ats-optimizer",
      icon: Star,
    },
    {
      title: "Job Board",
      href: "/dashboard/job-board",
      icon: Briefcase,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
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

