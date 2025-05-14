import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Function to get the current session
export async function getCurrentSession() {
  const supabase = createClientComponentClient<Database>()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    return null
  }

  return data.session
}

// Function to get the current user
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

// Function to get user profile
export async function getUserProfile(userId: string) {
  const supabase = createClientComponentClient<Database>()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error getting user profile:", error)
    return null
  }

  return data
}

// Function to check if user is premium
export async function isUserPremium(userId: string) {
  const profile = await getUserProfile(userId)
  return profile?.subscription_tier === "premium" && profile?.subscription_status === "active"
}

// Function to check if user is corporate
export async function isUserCorporate(userId: string) {
  const profile = await getUserProfile(userId)
  return profile?.subscription_tier === "corporate" && profile?.subscription_status === "active"
}

// Function to check if user is admin
export async function isUserAdmin(userId: string) {
  const profile = await getUserProfile(userId)
  return profile?.subscription_tier === "admin"
}

// Function to sign out
export async function signOut() {
  const supabase = createClientComponentClient()
  await supabase.auth.signOut()

  // Clear any local storage items
  localStorage.removeItem("supabase.auth.token")

  // Clear any other auth-related items
  Object.keys(localStorage).forEach((key) => {
    if (key.includes("supabase") || key.includes("auth") || key.includes("token")) {
      localStorage.removeItem(key)
    }
  })

  // Force reload to clear all state
  window.location.href = "/"
}
