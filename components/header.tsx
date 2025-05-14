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
import { FileText, Folder, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"

export function Header() {
  const { user, profile, signOut } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const { data } = await supabase.auth.getSession()
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const isInternalPage =
    pathname?.includes("/dashboard") ||
    pathname?.includes("/admin") ||
    pathname?.includes("/corporate") ||
    pathname?.includes("/settings")

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ EARLY RETURN WHILE LOADING TO AVOID HYDRATION MISMATCH
  if (isLoading) {
    return null
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href={user ? "/dashboard" : "/"} className="-m-1.5 p-1.5 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">CV Chap Chap</span>
          </Link>
        </div>

        {/* Only show navigation menu for logged in users */}
        {user ? (
          <>
            <div className="hidden lg:flex lg:gap-x-8">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                } hover:text-primary`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/resume-builder"
                className={`text-sm font-medium ${
                  pathname?.includes("/dashboard/resume-builder") ? "text-primary" : "text-muted-foreground"
                } hover:text-primary`}
              >
                Resume Builder
              </Link>
              <Link
                href="/dashboard/cover-letters"
                className={`text-sm font-medium ${
                  pathname?.includes("/dashboard/cover-letters") ? "text-primary" : "text-muted-foreground"
                } hover:text-primary`}
              >
                Cover Letters
              </Link>
              <Link
                href="/dashboard/job-board"
                className={`text-sm font-medium ${
                  pathname?.includes("/dashboard/job-board") ? "text-primary" : "text-muted-foreground"
                } hover:text-primary`}
              >
                Job Board
              </Link>
            </div>

            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                      <AvatarFallback>
                        {profile?.full_name
                          ? profile.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/files">
                        <Folder className="mr-2 h-4 w-4" />
                        <span>Files</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu */}
            <div className="flex lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-m-2.5 p-2.5">
                    <span className="sr-only">Open main menu</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="font-bold text-xl">CV Chap Chap</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-m-2.5 p-2.5"
                    >
                      <span className="sr-only">Close menu</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="space-y-2 py-6">
                      <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/resume-builder"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Resume Builder
                      </Link>
                      <Link
                        href="/dashboard/cover-letters"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Cover Letters
                      </Link>
                      <Link
                        href="/dashboard/job-board"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Job Board
                      </Link>
                    </div>
                    <div className="border-t py-6">
                      <Link
                        href="/settings/profile"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 hover:bg-muted w-full text-left"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          // For non-logged in users, show login/signup buttons
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:flex md:gap-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
            <div className="flex md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-m-2.5 p-2.5">
                    <span className="sr-only">Open main menu</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="font-bold text-xl">CV Chap Chap</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-m-2.5 p-2.5"
                    >
                      <span className="sr-only">Close menu</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="border-t py-6">
                      <Link
                        href="/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
