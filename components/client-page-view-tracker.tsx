"use client"

import dynamic from "next/dynamic"

// Use dynamic import with no SSR for performance improvement
const PageViewTracker = dynamic(() => import("@/components/analytics/page-view-tracker"), { ssr: false })

export function ClientPageViewTracker() {
  return <PageViewTracker />
}
