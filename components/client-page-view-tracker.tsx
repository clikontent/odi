"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Use dynamic import with no SSR for performance improvement
const PageViewTrackerComponent = dynamic(
  () => import("@/components/analytics/page-view-tracker").then((mod) => ({ default: mod.PageViewTracker })),
  { ssr: false },
)

export function ClientPageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerComponent />
    </Suspense>
  )
}
