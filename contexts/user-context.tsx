"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

type UserContextType = {
  user: any
  profile: any
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (!user) return

    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session?.user) {
          setUser(session.user)

          // Fetch profile data
          const profileData = await fetchProfile(session.user.id)

          if (profileData) {
            setProfile(profileData)
          } else {
            // If profile doesn't exist, create a default one
            const { error: insertError } = await supabase.from("profiles").insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || "",
              subscription_tier: "free",
              subscription_end_date: null,
            })

            if (insertError) {
              console.error("Error creating default profile:", insertError)
            } else {
              // Fetch the newly created profile
              const newProfile = await fetchProfile(session.user.id)
              if (newProfile) {
                setProfile(newProfile)
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize auth
    initializeAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        if (profileData) {
          setProfile(profileData)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
