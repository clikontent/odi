"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { safeSupabaseQuery } from "@/lib/fetch-utils"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabaseClient"

// Define the context type
interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
  refreshProfile: () => Promise<void>
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
})

// Custom hook to use the user context
export const useUser = () => useContext(UserContext)

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(`Error fetching session: ${sessionError.message}`)
      }

      if (!session) {
        // No session, so no user is logged in
        setUser(null)
        setProfile(null)
        return
      }

      // Set the user from the session
      setUser(session.user)

      // Fetch the user's profile
      if (session.user) {
        try {
          const profile = await safeSupabaseQuery(() =>
            supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          )

          setProfile(profile)
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
          // Don't throw here, we still have the user
          setProfile(null)
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error)
      setError(error instanceof Error ? error : new Error("Unknown error fetching user data"))
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh the profile
  const refreshProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      const profile = await safeSupabaseQuery(() => supabase.from("profiles").select("*").eq("id", user.id).single())

      setProfile(profile)
    } catch (error) {
      console.error("Error refreshing profile:", error)
      setError(error instanceof Error ? error : new Error("Unknown error refreshing profile"))
    } finally {
      setLoading(false)
    }
  }

  // Set up auth state listener
  useEffect(() => {
    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        refreshProfile()
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Provide the context value
  const value = {
    user,
    profile,
    loading,
    error,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
