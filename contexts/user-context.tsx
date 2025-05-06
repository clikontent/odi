"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { UserProfile, UserStats, UserSettings } from "@/types/user"

interface UserContextType {
  user: UserProfile | null
  isLoading: boolean
  userStats: UserStats | null
  userSettings: UserSettings | null
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          setUser(null)
          setUserStats(null)
          setUserSettings(null)
          return
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // Profile doesn't exist yet, create it
            console.log("Profile not found, creating one")
            const { data: userData } = await supabase.auth.getUser()

            if (userData.user) {
              const newProfile = {
                id: authUser.id,
                email: userData.user.email || "",
                full_name: userData.user.user_metadata?.full_name || "",
                subscription_tier: userData.user.user_metadata?.is_corporate ? "pending_corporate" : "free",
                company_name: userData.user.user_metadata?.company_name || null,
                company_size: userData.user.user_metadata?.company_size || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }

              const { data: createdProfile, error: createError } = await supabase
                .from("profiles")
                .insert(newProfile)
                .select()
                .single()

              if (createError) {
                console.error("Error creating profile:", createError)
                throw createError
              }

              setUser(createdProfile as UserProfile)
            } else {
              throw new Error("User not found")
            }
          } else {
            console.error("Error fetching profile:", profileError)
            throw profileError
          }
        } else {
          setUser(profileData as UserProfile)
        }

        // Get user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError
        }

        // Get user stats
        const { data: statsData, error: statsError } = await supabase.rpc("get_user_stats", {
          user_id_param: authUser.id,
        })

        if (statsError && statsError.code !== "PGRST116") {
          throw statsError
        }

        setUser(profileData as UserProfile)
        setUserSettings(
          (settingsData as UserSettings) || {
            id: "",
            user_id: authUser.id,
            email_notifications: true,
            application_updates: true,
            marketing_emails: false,
            job_alerts: true,
            two_factor_auth: false,
            theme: "system",
            language: "en",
            timezone: "UTC",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        )
        setUserStats(
          statsData || {
            total_resumes: 0,
            total_cover_letters: 0,
            total_applications: 0,
            total_files: 0,
            storage_used: 0,
            storage_limit: 100 * 1024 * 1024, // 100MB for free users
          },
        )
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchUserData()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserStats(null)
        setUserSettings(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    try {
      setIsLoading(true)

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        return
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      if (error) throw error

      setUser(data as UserProfile)
    } catch (error) {
      console.error("Error refreshing user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (error) throw error

      setUser({ ...user, ...updates })

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "update",
        entity_type: "profile",
        entity_id: user.id,
        details: { updated_fields: Object.keys(updates) },
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      if (!user || !userSettings) return

      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase.from("user_settings").update(updates).eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase.from("user_settings").insert({
          user_id: user.id,
          ...userSettings,
          ...updates,
        })

        if (error) throw error
      }

      setUserSettings({ ...userSettings, ...updates })
    } catch (error) {
      console.error("Error updating settings:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserStats(null)
      setUserSettings(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    isLoading,
    userStats,
    userSettings,
    refreshUser,
    updateProfile,
    updateSettings,
    signOut,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
