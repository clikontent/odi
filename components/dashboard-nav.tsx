"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, X, Home, FileText, Briefcase, CheckSquare, Settings, LogOut, User, CreditCard, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"

type UserProfile = {
  id: string
  full_name?: string | null
  subscription_tier?: string | null
}

export default function DashboardNav({ user }: { user: UserProfile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Define navigation items
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Resume Builder", href: "/dashboard/resume-builder", icon: FileText },
    { name: "Job Board", href: "/dashboard/job-board", icon: Briefcase },
    { name: "ATS Optimizer", href: "/dashboard/ats-optimizer", icon: CheckSquare },
  ]

  const userNavigationItems = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Billing", href: "/settings/billing", icon: CreditCard },
    { name: "Notifications", href: "/settings/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Log Out", href: "/logout", icon: LogOut },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r pt-5 bg-card overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">CV Chap Chap</span>
            </Link>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-border pt-4 px-2">
              <div className="space-y-1">
                {userNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-5 w-5 text-muted-foreground group-hover:text-foreground"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 flex z-40">
          <div
            className={cn(
              "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity",
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={cn(
              "relative flex-1 flex flex-col max-w-xs w-full bg-card transition transform ease-in-out duration-300",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl">CV Chap Chap</span>
                </Link>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "mr-4 flex-shrink-0 h-6 w-6",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-border p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <UserAvatar userId={user.id} />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-foreground">{user.full_name || "User"}</p>
                    <p className="text-sm font-medium text-muted-foreground">{user.subscription_tier || "Free"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 px-2 pb-4">
              <div className="space-y-1">
                {userNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-muted-foreground group-hover:text-foreground"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-background">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
