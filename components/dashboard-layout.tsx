"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { ClientPageViewTracker } from "@/components/client-page-view-tracker"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorFallback } from "@/components/error-fallback"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ErrorBoundary fallback={<ErrorFallback />}>
        <main className="flex-1">{children}</main>
      </ErrorBoundary>
      <ClientPageViewTracker pathname={pathname} />
    </div>
  )
}
