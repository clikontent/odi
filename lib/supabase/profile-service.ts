import { createClient } from "./server"

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
  location: string | null
  phone: string | null
  subscription_tier: string
  subscription_expires_at: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data as Profile
}

export async function updateProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data as Profile
}

