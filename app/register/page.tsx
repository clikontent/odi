import { RegisterForm } from "@/components/auth/register-form"
import { QuoteDisplay } from "@/components/auth/quote-display"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full">
      <QuoteDisplay />
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-md p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

