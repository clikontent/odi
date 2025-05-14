"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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
  handleUpgradeClick: () => void
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
  handleUpgradeClick: () => {},
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
  const router = useRouter()

  // Derived state for user roles
  const isPremium = profile?.subscription_tier === "premium" && profile?.subscription_status === "active"
  const isCorporate = profile?.subscription_tier === "corporate" && profile?.subscription_status === "active"
  const isAdmin = profile?.subscription_tier === "admin"

  // Function to handle upgrade button clicks
  const handleUpgradeClick = useCallback(() => {
    if (!user) {
      router.push("/login?redirect=/pricing")
      return
    }

    if (isPremium) {
      // Premium users upgrade to corporate
      router.push("/payment?plan=corporate&interval=monthly")
    } else {
      // Free users upgrade to premium
      router.push("/payment?plan=premium&interval=monthly")
    }
  }, [user, isPremium, router])

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
        setLoading(false)
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

          if (profileError) {
            // If profile doesn't exist, create it
            if (profileError.code === "PGRST116") {
              const newProfile = {
                id: sessionData.session.user.id,
                email: sessionData.session.user.email,
                full_name: sessionData.session.user.user_metadata?.full_name || "",
                subscription_tier: "free",
                subscription_status: "inactive",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }

              const { data: createdProfile, error: createError } = await supabase
                .from("profiles")
                .insert(newProfile)
                .select()
                .single()

              if (createError) throw createError
              setProfile(createdProfile)
            } else {
              throw profileError
            }
          } else {
            setProfile(profileData)
          }

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

      // Force reload to clear all state
      window.location.href = "/"

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
      if (!isPremium && !isCorporate && !isAdmin && userStats.coverLettersUsed >= 5) {
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
  }, [user, userStats, isPremium, isCorporate, isAdmin])

  // Function to increment resume download count
  const incrementResumeDownloadCount = useCallback(async () => {
    if (!user || !userStats) return false

    try {
      // Check if user can download more resumes
      if (!isPremium && !isCorporate && !isAdmin && userStats.resumeDownloadsUsed >= 1) {
        return false
      }

      if (isPremium && !isCorporate && !isAdmin && userStats.resumeDownloadsUsed >= 10) {
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
  }, [user, userStats, isPremium, isCorporate, isAdmin])

  // Function to check if user can use a feature
  const canUseFeature = useCallback(
    (feature: "coverLetter" | "resumeDownload" | "atsOptimization" | "interviewPrep") => {
      if (!profile || !userStats) return false

      // Admin and corporate users can use all features
      if (isAdmin || isCorporate) {
        return true
      }

      // Premium users can use most features with some limits
      if (isPremium) {
        switch (feature) {
          case "coverLetter":
            return true // Unlimited for premium
          case "resumeDownload":
            return userStats.resumeDownloadsUsed < 10 // Limited to 10 for premium
          case "atsOptimization":
            return true // Available for premium
          case "interviewPrep":
            return true // Available for premium
          default:
            return false
        }
      }

      // Free users have very limited access
      switch (feature) {
        case "coverLetter":
          return userStats.coverLettersUsed < 5 // Limited to 5 for free
        case "resumeDownload":
          return userStats.resumeDownloadsUsed < 1 // Limited to 1 for free
        case "atsOptimization":
          return false // Not available for free
        case "interviewPrep":
          return false // Not available for free
        default:
          return false
      }
    },
    [profile, userStats, isPremium, isCorporate, isAdmin],
  )

  // Set up auth state listener
  useEffect(() => {
    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setUser(session.user)
          // Fetch profile and stats when auth state changes
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              // If profile doesn't exist, create it
              if (profileError.code === "PGRST116") {
                const newProfile = {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || "",
                  subscription_tier: "free",
                  subscription_status: "inactive",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }

                const { data: createdProfile, error: createError } = await supabase
                  .from("profiles")
                  .insert(newProfile)
                  .select()
                  .single()

                if (createError) throw createError
                setProfile(createdProfile)
              } else {
                throw profileError
              }
            } else {
              setProfile(profileData)
            }

            // Fetch user stats
            const stats = await fetchUserStats(session.user.id)
            setUserStats(stats)
          } catch (error) {
            console.error("Error fetching profile on auth change:", error)
          }
        }
      } else if (event === "SIGNED_OUT") {
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
    handleUpgradeClick,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
