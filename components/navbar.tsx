"use client"

import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
  Menu,
  X,
  UserIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
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
import { NotificationBell } from "@/components/notification-bell"

export function Navbar() {
  const { user, isLoading, signOut } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    { name: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
    { name: "Activity", href: "/activity", icon: BarChart },
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
  const navItems = userRole === "admin" ? adminNavItems : userRole === "corporate" ? corporateNavItems : regularNavItems

  const userNavigation = [
    { name: "Your Profile", href: "/settings/profile", icon: UserIcon },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (!authChecked || isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">CV Chap Chap</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CV Chap Chap</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href || pathname?.startsWith(`${item.href}/`) ? "default" : "ghost"}
                size="sm"
                className="h-9"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        )}

        {/* Mobile Menu Button */}
        {isAuthenticated && (
          <div className="flex md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:max-w-xs">
                <div className="flex items-center justify-between mb-6">
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/"}
                    className="flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">CV Chap Chap</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.name}
                      variant={pathname === item.href || pathname?.startsWith(`${item.href}/`) ? "default" : "ghost"}
                      size="sm"
                      className="justify-start"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                  <div className="pt-4 mt-4 border-t">
                    {userNavigation.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        size="sm"
                        className="justify-start w-full"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className="flex items-center gap-2">
          <ModeToggle />

          {isAuthenticated ? (
            <>
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
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
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
