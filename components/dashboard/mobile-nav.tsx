"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Mail, Menu, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Resumes",
    href: "/dashboard/resumes",
    icon: FileText,
  },
  {
    title: "Cover Letters",
    href: "/dashboard/cover-letters",
    icon: Mail,
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="px-2 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
            CV Chap
          </Link>
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

