"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { trackActivity } from "@/lib/analytics"

export function usePageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    // Track page view
    trackActivity({
      userId: user.id,
      entityType: "profile",
      action: "view",
      details: {
        page: pathname,
        query: Object.fromEntries(searchParams.entries()),
        timestamp: new Date().toISOString(),
      },
    })
  }, [pathname, searchParams, user])
}
