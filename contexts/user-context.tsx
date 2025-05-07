"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase"

interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  signOut: async () => {},
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current session
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(`Error fetching session: ${sessionError.message}`)
      }

      if (!data.session) {
        setUser(null)
        setProfile(null)
        return
      }

      // Set the user from the session
      setUser(data.session.user)

      // Fetch the user's profile
      if (data.session.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single()

          if (profileError) throw profileError
          setProfile(profileData)
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
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

  const refreshUser = async () => {
    await fetchUserData()
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        // Fetch profile when auth state changes
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data)
          })
          .catch((error) => {
            console.error("Error fetching profile on auth change:", error)
          })
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

  return (
    <UserContext.Provider value={{ user, profile, loading, error, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  )
}
