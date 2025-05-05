"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SecurityForm() {
  const { user, userSettings, updateSettings } = useUser()

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [twoFactorAuth, setTwoFactorAuth] = useState(userSettings?.two_factor_auth ?? false)

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmittingPassword(true)
      setPasswordError(null)
      setPasswordSuccess(null)

      // Validate passwords
      if (passwordData.new_password !== passwordData.confirm_password) {
        throw new Error("New passwords do not match")
      }

      if (passwordData.new_password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      })

      if (error) throw error

      // Reset form
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })

      setPasswordSuccess("Password updated successfully!")
    } catch (error: any) {
      console.error("Error updating password:", error)
      setPasswordError(error.message || "Failed to update password. Please try again.")
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    try {
      setIsSubmitting2FA(true)
      setTwoFactorError(null)
      setTwoFactorSuccess(null)

      // In a real app, you would implement proper 2FA setup here
      // This is just a simplified example
      await updateSettings({ two_factor_auth: checked })

      setTwoFactorAuth(checked)
      setTwoFactorSuccess(`Two-factor authentication ${checked ? "enabled" : "disabled"} successfully!`)
    } catch (error: any) {
      console.error("Error updating two-factor authentication:", error)
      setTwoFactorError(error.message || "Failed to update two-factor authentication. Please try again.")
      setTwoFactorAuth(!checked) // Revert toggle
    } finally {
      setIsSubmitting2FA(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmittingPassword}>
              {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmittingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="two_factor_auth" className="font-medium">
                Enable Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
            </div>
            <Switch
              id="two_factor_auth"
              checked={twoFactorAuth}
              onCheckedChange={handleTwoFactorToggle}
              disabled={isSubmitting2FA}
            />
          </div>

          {twoFactorError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{twoFactorError}</AlertDescription>
            </Alert>
          )}

          {twoFactorSuccess && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{twoFactorSuccess}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">{navigator.userAgent}</p>
                  <p className="text-xs text-muted-foreground mt-1">Started: {new Date().toLocaleString()}</p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out of All Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
