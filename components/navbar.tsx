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
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react"
import { useState } from "react"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"

export function Navbar() {
  const { user, profile } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Define main navigation items
  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Builder", href: "/dashboard/resume-builder", icon: FileText },
    { name: "Cover Letters", href: "/dashboard/cover-letters", icon: PenTool },
    { name: "Job Board", href: "/dashboard/job-board", icon: Briefcase },
    { name: "ATS Optimizer", href: "/dashboard/ats-optimizer", icon: FileCheck },
    { name: "Interview Prep", href: "/dashboard/interview-prep", icon: MessageSquare },
    { name: "Activity", href: "/activity", icon: Activity },
  ]

  // Define user dropdown navigation items
  const userNavItems = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Check if user is authenticated
  const isAuthenticated = !!user

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CV Chap Chap</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1 mx-4 flex-1 justify-center">
            {mainNavItems.map((item) => (
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

        {/* Right Side Items */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {isAuthenticated ? (
            <>
              <NotificationBell />

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {userNavItems.map((item) => (
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

              {/* Mobile Menu Button */}
              <div className="md:hidden">
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
                        href="/dashboard"
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
                      {mainNavItems.map((item) => (
                        <Button
                          key={item.name}
                          variant={
                            pathname === item.href || pathname?.startsWith(`${item.href}/`) ? "default" : "ghost"
                          }
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
                        {userNavItems.map((item) => (
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
