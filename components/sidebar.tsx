"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  PenTool,
  Briefcase,
  FileCheck,
  BarChart,
  Users,
  Settings,
  Shield,
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function Sidebar() {
  const { user, isLoading } = useUser()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("regular")

  // Check authentication status directly from Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setAuthChecked(true)

      if (data.session) {
        // Get user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (profileData) {
          const isCorporate = profileData.subscription_tier === "corporate"
          const isAdmin = profileData.email?.includes("admin")

          if (isAdmin) {
            setUserRole("admin")
          } else if (isCorporate) {
            setUserRole("corporate")
          } else {
            setUserRole("regular")
          }
        }
      }
    }

    checkAuth()
  }, [])

  // Define navigation items based on user role
  const regularNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Builder", href: "/dashboard/resume-templates", icon: FileText },
    { name: "Cover Letters", href: "/dashboard/cover-letters", icon: PenTool },
    { name: "Job Board", href: "/dashboard/job-board", icon: Briefcase },
    { name: "ATS Optimizer", href: "/dashboard/ats-optimizer", icon: FileCheck },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  const corporateNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Corporate Dashboard", href: "/corporate/dashboard", icon: Briefcase },
    { name: "Job Postings", href: "/corporate/dashboard", icon: FileText },
    { name: "Candidates", href: "/corporate/dashboard", icon: Users },
    { name: "Analytics", href: "/corporate/dashboard", icon: BarChart },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Admin Panel", href: "/admin", icon: Shield },
    { name: "Resume Builder", href: "/dashboard/resume-templates", icon: FileText },
    { name: "Cover Letters", href: "/dashboard/cover-letters", icon: PenTool },
    { name: "Job Board", href: "/dashboard/job-board", icon: Briefcase },
    { name: "User Management", href: "/admin", icon: Users },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  // Select navigation items based on user role
  const navItems = userRole === "admin" ? adminNavItems : userRole === "corporate" ? corporateNavItems : regularNavItems

  if (!authChecked || isLoading) {
    return (
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </aside>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "default" : "ghost"}
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
