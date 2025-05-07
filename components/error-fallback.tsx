"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  error: Error | null
  resetErrorBoundary?: () => void
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  message = "Something went wrong",
  actionLabel = "Try again",
  onAction,
}: ErrorFallbackProps) {
  const handleAction = () => {
    if (onAction) {
      onAction()
    } else if (resetErrorBoundary) {
      resetErrorBoundary()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Error</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-32">
            <p className="font-mono">{error.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAction} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
