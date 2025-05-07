import { createClient } from "@supabase/supabaseClient.ts"
import type { Database } from "./database.types"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Function to ensure storage buckets exist
export async function ensureStorageBuckets() {
  try {
    // Check if buckets exist and create them if they don't
    const { data: buckets, error } = await supabase.storage.listBuckets()

    const requiredBuckets = ["resumes", "cover-letters", "profile-images", "documents"]

    for (const bucket of requiredBuckets) {
      if (!buckets?.find((b) => b.name === bucket)) {
        await supabase.storage.createBucket(bucket, {
          public: false,
        })
      }
    }
  } catch (error) {
    console.error("Error ensuring storage buckets:", error)
  }
}

// Export types for convenience
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ResumeTemplate = Database["public"]["Tables"]["resume_templates"]["Row"]
export type CoverLetterTemplate = Database["public"]["Tables"]["cover_letter_templates"]["Row"]
export type Resume = Database["public"]["Tables"]["resumes"]["Row"]
export type CoverLetter = Database["public"]["Tables"]["cover_letters"]["Row"]
export type JobApplication = Database["public"]["Tables"]["job_applications"]["Row"]
export type UserFile = Database["public"]["Tables"]["user_files"]["Row"]
export type Payment = Database["public"]["Tables"]["payments"]["Row"]
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"]
export type AIUsage = Database["public"]["Tables"]["ai_usage"]["Row"]
