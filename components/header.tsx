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
  const { user, profile, signOut } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setIsLoading(false)
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

  const isInternalPage =
    pathname?.includes("/dashboard") ||
    pathname?.includes("/admin") ||
    pathname?.includes("/corporate") ||
    pathname?.includes("/settings")

  const showPublicNav = !isInternalPage && !isAuthenticated

  const userNavigation = [
    { name: "Your Profile", href: "/settings/profile", icon: User },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Files", href: "/files", icon: Folder },
    { name: "Settings", href: "/settings/profile", icon: Settings },
  ]

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      await supabase.auth.signOut()
      localStorage.removeItem("supabase.auth.token")
      router.push("/")
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ EARLY RETURN WHILE LOADING TO AVOID HYDRATION MISMATCH
  if (isLoading) {
    return null // or return a <HeaderSkeleton /> if you want a loading UI
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

        {/* Navigation logic continues exactly as you had it */}
        {/* ... rest of your original JSX remains unchanged ... */}

        {/* Final div containing login/signup or authenticated dropdowns */}
      </nav>
    </header>
  )
}
