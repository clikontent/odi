"use client"

import { BillingForm } from "@/components/settings/billing-form"

export default function BillingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription plan and payment methods</p>
        </div>

        <BillingForm />
      </div>
    </div>
  )
}
