"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
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
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, FileText, Folder, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"

export function Header() {
  const { user, signOut, isLoading } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status directly from Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setAuthChecked(true)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAuthenticated(true)
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Determine if we're on an internal page (dashboard, admin, etc.)
  const isInternalPage =
    pathname?.includes("/dashboard") ||
    pathname?.includes("/admin") ||
    pathname?.includes("/corporate") ||
    pathname?.includes("/settings")

  // Determine what navigation items to show based on page context
  const showNavInHeader = !isInternalPage

  const userNavigation = [
    { name: "Your Profile", href: "/settings/profile", icon: User },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Files", href: "/files", icon: Folder },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="-m-1.5 p-1.5 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">CV Chap Chap</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {!isAuthenticated ? (
            <>
              <Link
                href="/#features"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/#testimonials"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Testimonials
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/resume-builder"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Resume Builder
              </Link>
              <Link
                href="/dashboard/job-board"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                Job Board
              </Link>
              <Link
                href="/dashboard/ats-optimizer"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground"
              >
                ATS Optimizer
              </Link>
            </>
          )}
        </div>

        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:max-w-md">
              <div className="flex items-center justify-between">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/"}
                  className="-m-1.5 p-1.5 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl">CV Chap Chap</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-border">
                  {!isAuthenticated ? (
                    <div className="space-y-2 py-6">
                      <Link
                        href="/#features"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Features
                      </Link>
                      <Link
                        href="/#pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/#testimonials"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Testimonials
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 py-6">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/resume-builder"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Resume Builder
                      </Link>
                      <Link
                        href="/dashboard/job-board"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Job Board
                      </Link>
                      <Link
                        href="/dashboard/ats-optimizer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        ATS Optimizer
                      </Link>
                    </div>
                  )}
                  {isAuthenticated ? (
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
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="-mx-3 flex w-full items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted text-left"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          {!authChecked ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isAuthenticated ? (
            <>
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
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ModeToggle />
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
