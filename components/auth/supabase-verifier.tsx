"use client"

import { useEffect, useState } from "react"
import { verifySupabaseConnection } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function SupabaseVerifier() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const result = await verifySupabaseConnection()

        if (result.success) {
          setStatus("success")
          setMessage(result.message || "Supabase connection verified successfully")
        } else {
          setStatus("error")
          setMessage(result.error || "Failed to connect to Supabase")
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "An unexpected error occurred")
      }
    }

    verifyConnection()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-muted">
        <AlertCircle className="h-4 w-4 animate-spin" />
        <AlertTitle>Verifying Supabase Connection</AlertTitle>
        <AlertDescription>Please wait while we verify the connection to Supabase...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>{message}. Please check your Supabase API keys and configuration.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Connection Successful</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

