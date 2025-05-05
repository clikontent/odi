import type { ReactNode } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"

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
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <DashboardNav
          user={profile || { id: session.user.id, full_name: session.user.email, subscription_tier: "free" }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
