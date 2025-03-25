"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "./login-form"

export function RedirectHandler() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirectedFrom") || "/dashboard"

  return <LoginForm redirectPath={redirectPath} />
}

