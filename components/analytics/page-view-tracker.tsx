"use client"

import { usePageView } from "@/hooks/use-page-view"

export default function PageViewTracker() {
  usePageView()
  return null
}

// Add a named export to fix the error
export { PageViewTracker }
