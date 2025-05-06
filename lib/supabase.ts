import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Create a singleton instance for server-side
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = (() => {
  if (typeof window === "undefined") {
    // Server-side: Use createClient
    if (supabaseInstance) return supabaseInstance
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
    return supabaseInstance
  } else {
    // Client-side: Use createClientComponentClient
    return createClientComponentClient<Database>()
  }
})()

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

// Helper function to ensure storage buckets exist
export async function ensureStorageBuckets() {
  try {
    // Check if user_files bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error listing buckets:", error)
      return false
    }

    const userFilesBucketExists = buckets.some((bucket) => bucket.name === "user_files")

    if (!userFilesBucketExists) {
      console.log("Creating user_files bucket")
      const { error: createError } = await supabase.storage.createBucket("user_files", {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error creating user_files bucket:", createError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring storage buckets:", error)
    return false
  }
}
