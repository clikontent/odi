import { Suspense } from "react"
import { QuoteDisplay } from "@/components/auth/quote-display"
import { RedirectHandler } from "@/components/auth/redirect-handler"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <QuoteDisplay />
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <Suspense fallback={<LoginForm />}>
            <RedirectHandler />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

