import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user data
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      // If profile doesn't exist, create one
      if (profileError || !profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          subscription_tier: "free",
          subscription_end_date: null,
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/dashboard")
}
