"use client"

import { SecurityForm } from "@/components/settings/security-form"

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and authentication</p>
        </div>

        <SecurityForm />
      </div>
    </div>
  )
}
