import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Create a Supabase client for server component
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    // Redirect to login if not authenticated
    redirect("/login")
  }

  return <>{children}</>
}
