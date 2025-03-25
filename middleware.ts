import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables in middleware")
    return NextResponse.next() // Allow access instead of redirecting
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Redirect users without a session trying to access protected pages
  if (!session && pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Prevent logged-in users from accessing auth pages
  if (session && ["/", "/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
