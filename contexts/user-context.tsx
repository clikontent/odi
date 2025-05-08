"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase"

// Define user stats interface
interface UserStats {
  coverLettersUsed: number
  resumeDownloadsUsed: number
  storage_used?: number
  storage_limit?: number
}

// Define the context type
interface UserContextType {
  user: User | null
  profile: Profile | null
  userStats: UserStats | null
  loading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
  incrementCoverLetterCount: () => Promise<boolean>
  incrementResumeDownloadCount: () => Promise<boolean>
  canUseFeature: (feature: "coverLetter" | "resumeDownload" | "atsOptimization" | "interviewPrep") => boolean
  isPremium: boolean
  isCorporate: boolean
  isAdmin: boolean
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  userStats: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  signOut: async () => {},
  incrementCoverLetterCount: async () => false,
  incrementResumeDownloadCount: async () => false,
  canUseFeature: () => false,
  isPremium: false,
  isCorporate: false,
  isAdmin: false,
})

// Custom hook to use the user context
export const useUser = () => useContext(UserContext)

// Provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Derived state for user roles
  const isPremium = profile?.subscription_tier === "premium" && profile?.subscription_status === "active"
  const isCorporate = profile?.subscription_tier === "corporate" && profile?.subscription_status === "active"
  const isAdmin = profile?.subscription_tier === "admin"

  // Function to fetch user stats
  const fetchUserStats = useCallback(async (userId: string) => {
    try {
      // Get user stats from the database
      const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (error) {
        // If no stats exist yet, create default stats
        if (error.code === "PGRST116") {
          const defaultStats = {
            user_id: userId,
            cover_letters_used: 0,
            resume_downloads_used: 0,
            storage_used: 0,
            storage_limit: 100 * 1024 * 1024, // 100MB default
          }

          const { data: newStats, error: insertError } = await supabase
            .from("user_stats")
            .insert(defaultStats)
            .select()
            .single()

          if (insertError) throw insertError

          return {
            coverLettersUsed: 0,
            resumeDownloadsUsed: 0,
            storage_used: 0,
            storage_limit: 100 * 1024 * 1024,
          }
        }
        throw error
      }

      return {
        coverLettersUsed: data.cover_letters_used || 0,
        resumeDownloadsUsed: data.resume_downloads_used || 0,
        storage_used: data.storage_used || 0,
        storage_limit: data.storage_limit || 100 * 1024 * 1024,
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return null
    }
  }, [])

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(`Error fetching session: ${sessionError.message}`)
      }

      if (!sessionData.session) {
        // No session, so no user is logged in
        setUser(null)
        setProfile(null)
        setUserStats(null)
        return
      }

      // Set the user from the session
      setUser(sessionData.session.user)

      // Fetch the user's profile
      if (sessionData.session.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()

          if (profileError) throw profileError
          setProfile(profileData)

          // Fetch user stats
          const stats = await fetchUserStats(sessionData.session.user.id)
          setUserStats(stats)
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
  }, [fetchUserStats])

  // Function to refresh the user data
  const refreshUser = useCallback(async () => {
    await fetchUserData()
  }, [fetchUserData])

  // Function to sign out
  const signOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear all state
      setUser(null)
      setProfile(null)
      setUserStats(null)

      // Clear any local storage items related to auth
      localStorage.removeItem("supabase.auth.token")

      // Clear any other auth-related items from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("supabase") || key.includes("auth") || key.includes("token")) {
          localStorage.removeItem(key)
        }
      })

      // Clear session cookies if any
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      return true
    } catch (error) {
      console.error("Error signing out:", error)
      return false
    }
  }, [])

  // Function to increment cover letter count
  const incrementCoverLetterCount = useCallback(async () => {
    if (!user || !userStats) return false

    try {
      // Check if user can create more cover letters
      if (profile?.subscription_tier === "free" && userStats.coverLettersUsed >= 5) {
        return false
      }

      // Increment the count
      const { error } = await supabase
        .from("user_stats")
        .update({ cover_letters_used: userStats.coverLettersUsed + 1 })
        .eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setUserStats({
        ...userStats,
        coverLettersUsed: userStats.coverLettersUsed + 1,
      })

      return true
    } catch (error) {
      console.error("Error incrementing cover letter count:", error)
      return false
    }
  }, [user, profile, userStats])

  // Function to increment resume download count
  const incrementResumeDownloadCount = useCallback(async () => {
    if (!user || !userStats) return false

    try {
      // Check if user can download more resumes
      if (profile?.subscription_tier === "free" && userStats.resumeDownloadsUsed >= 1) {
        return false
      }

      if (profile?.subscription_tier === "premium" && userStats.resumeDownloadsUsed >= 10) {
        return false
      }

      // Increment the count
      const { error } = await supabase
        .from("user_stats")
        .update({ resume_downloads_used: userStats.resumeDownloadsUsed + 1 })
        .eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setUserStats({
        ...userStats,
        resumeDownloadsUsed: userStats.resumeDownloadsUsed + 1,
      })

      return true
    } catch (error) {
      console.error("Error incrementing resume download count:", error)
      return false
    }
  }, [user, profile, userStats])

  // Function to check if user can use a feature
  const canUseFeature = useCallback(
    (feature: "coverLetter" | "resumeDownload" | "atsOptimization" | "interviewPrep") => {
      if (!profile || !userStats) return false

      const tier = profile.subscription_tier || "free"
      const isActive = profile.subscription_status === "active"

      // Corporate and admin users can use all features
      if ((tier === "corporate" || tier === "admin") && isActive) {
        return true
      }

      switch (feature) {
        case "coverLetter":
          return tier === "premium" && isActive ? true : userStats.coverLettersUsed < 5
        case "resumeDownload":
          return (
            (tier === "premium" && isActive && userStats.resumeDownloadsUsed < 10) ||
            (tier === "free" && userStats.resumeDownloadsUsed < 1)
          )
        case "atsOptimization":
          return tier === "premium" && isActive
        case "interviewPrep":
          return tier === "premium" && isActive
        default:
          return false
      }
    },
    [profile, userStats],
  )

  // Set up auth state listener
  useEffect(() => {
    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        // Fetch profile and stats when auth state changes
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data)
            return fetchUserStats(session.user.id)
          })
          .then((stats) => {
            setUserStats(stats)
          })
          .catch((error) => {
            console.error("Error fetching profile on auth change:", error)
          })
      } else {
        setUser(null)
        setProfile(null)
        setUserStats(null)
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserData, fetchUserStats])

  // Provide the context value
  const value = {
    user,
    profile,
    userStats,
    loading,
    error,
    refreshUser,
    signOut,
    incrementCoverLetterCount,
    incrementResumeDownloadCount,
    canUseFeature,
    isPremium,
    isCorporate,
    isAdmin,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
