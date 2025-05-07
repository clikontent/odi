import { BarChart, Calendar, Home, ListChecks, MessageSquare, Settings, User } from "lucide-react"

import type { NavItem } from "@/types"

export const dashboardNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: ListChecks,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Interview Prep",
    href: "/dashboard/interview-prep",
    icon: MessageSquare,
  },
]

export const settingsNavItems: NavItem[] = [
  {
    title: "Profile",
    href: "/dashboard/settings/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]
