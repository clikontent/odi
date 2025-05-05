import type { ReactNode } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import TopNavbar from "@/components/top-navbar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
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

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar user={profile || { id: session.user.id, full_name: session.user.email, subscription_tier: "free" }} />
      <main className="flex-1 p-4 md:p-6 pt-16">{children}</main>
    </div>
  )
}
