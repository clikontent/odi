import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables in middleware")
    // Redirect to an error page or continue to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected routes
    if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If session exists and trying to access auth pages
    if (
      session &&
      (request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Error in middleware:", error)
    // On error, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

