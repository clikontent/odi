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
  Menu,
  X,
  Bell,
  LogOut,
  UserIcon,
  Folder,
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function TopNavigation() {
  const { user, signOut, isLoading } = useUser()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("regular")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
  ]

  const corporateNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Corporate Dashboard", href: "/corporate/dashboard", icon: Briefcase },
    { name: "Job Postings", href: "/corporate/dashboard", icon: FileText },
    { name: "Candidates", href: "/corporate/dashboard", icon: Users },
    { name: "Analytics", href: "/corporate/dashboard", icon: BarChart },
  ]

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Admin Panel", href: "/admin", icon: Shield },
    { name: "Resume Builder", href: "/dashboard/resume-templates", icon: FileText },
    { name: "Cover Letters", href: "/dashboard/cover-letters", icon: PenTool },
    { name: "Job Board", href: "/dashboard/job-board", icon: Briefcase },
    { name: "User Management", href: "/admin", icon: Users },
  ]

  // Select navigation items based on user role
  const navItems = userRole === "admin" ? adminNavItems : userRole === "corporate" ? corporateNavItems : regularNavItems // fallback

  const userNavigation = [
    { name: "Your Profile", href: "/settings/profile", icon: UserIcon },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Files", href: "/files", icon: Folder },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  if (!authChecked || isLoading) {
    return (
      <div className="h-16 border-b bg-background flex items-center px-4">
        <div className="flex-1 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl ml-2">CV Chap Chap</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-16 border-b bg-background sticky top-0 z-50">
      <div className="flex-1 flex justify-between items-center h-full max-w-7xl mx-auto px-4">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl ml-2 hidden sm:inline">CV Chap Chap</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "default" : "ghost"}
              size="sm"
              className="flex items-center"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:max-w-md">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl ml-2">CV Chap Chap</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-border">
                  <div className="space-y-2 py-6">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="-mx-3 flex w-full items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted text-left"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side - user menu */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="cursor-pointer py-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">New job match found</p>
                      <p className="text-sm text-muted-foreground">
                        We found a new job that matches your profile: Frontend Developer at Google
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer justify-center font-medium">
                <Link href="/notifications">View all notifications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || ""} />
                  <AvatarFallback>{user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                  {user?.subscription_tier !== "free" && (
                    <Badge variant="outline" className="mt-1 w-fit">
                      {user?.subscription_tier === "admin" ? "Admin" : "Corporate"}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {userNavigation.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
