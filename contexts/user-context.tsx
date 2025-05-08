"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase"

interface UserContextType {
  user: (Profile & { email?: string }) | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(Profile & { email?: string }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authUser, setAuthUser] = useState<User | null>(null)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!authUser) return

    const profile = await fetchUserProfile(authUser.id)
    if (profile) {
      setUser({
        ...profile,
        email: authUser.email,
      })
    }
  }, [authUser, fetchUserProfile])

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true)

        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setAuthUser(session.user)
          const profile = await fetchUserProfile(session.user.id)

          if (profile) {
            setUser({
              ...profile,
              email: session.user.email,
            })
          }
        }
      } catch (error) {
        console.error("Error initializing user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user)
        const profile = await fetchUserProfile(session.user.id)

        if (profile) {
          setUser({
            ...profile,
            email: session.user.email,
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setAuthUser(null)
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signOut,
      refreshUser,
    }),
    [user, isLoading, signOut, refreshUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
