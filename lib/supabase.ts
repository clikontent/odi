import { createClient } from "@supabase/supabase-js"

// Define types based on the revised schema
export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
  location: string | null
  phone: string | null
  email: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  twitter: string | null
  bio: string | null
  subscription_tier: "free" | "premium" | "professional"
  subscription_expires_at: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type ResumeTemplate = {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  html_content: string
  css_content: string | null
  js_content: string | null
  category: string
  is_premium: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CoverLetterTemplate = {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  html_content: string
  css_content: string | null
  js_content: string | null
  category: string
  is_premium: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Resume = {
  id: string
  user_id: string
  title: string
  content: any // JSONB content
  template_id: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type CoverLetter = {
  id: string
  user_id: string
  title: string
  content: any // JSONB content
  template_id: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type JobApplication = {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_description: string | null
  job_location: string | null
  job_url: string | null
  application_date: string
  status: "saved" | "applied" | "interview" | "offer" | "rejected"
  resume_id: string | null
  cover_letter_id: string | null
  next_step: string | null
  next_step_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type UserFile = {
  id: string
  user_id: string
  filename: string
  original_filename: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  amount: number
  currency: string
  payment_method: string
  payment_status: "pending" | "completed" | "failed" | "refunded"
  transaction_id: string | null
  payment_provider: string
  payment_details: any | null
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  plan_name: string
  plan_price: number
  currency: string
  billing_cycle: "monthly" | "yearly"
  start_date: string
  end_date: string
  is_active: boolean
  auto_renew: boolean
  payment_id: string | null
  created_at: string
  updated_at: string
}

// Create a singleton Supabase client for interacting with your database
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please check your .env file or environment configuration.")
    throw new Error("Missing Supabase environment variables")
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return supabaseInstance
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// Verify Supabase connection
export const verifySupabaseConnection = async () => {
  try {
    const supabase = createSupabaseClient()

    // Try a simple query to verify connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase connection verification failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Supabase connection verified successfully" }
  } catch (error: any) {
    console.error("Error verifying Supabase connection:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

// Helper functions for authentication
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const supabase = createSupabaseClient()

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      console.error("Error signing up:", authError)
      return { error: authError }
    }

    return { data: authData }
  } catch (error: any) {
    console.error("Unexpected error during signup:", error)
    return { error: { message: error.message || "An unexpected error occurred" } }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error)
      return { error }
    }

    return { data }
  } catch (error: any) {
    console.error("Unexpected error during signin:", error)
    return { error: { message: error.message || "An unexpected error occurred" } }
  }
}

export const signOut = async () => {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return { error }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error during signout:", error)
    return { error: { message: error.message || "An unexpected error occurred" } }
  }
}

export const getCurrentUser = async () => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return { user: null }
    }

    // Get the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { user: data.user }
    }

    return { user: { ...data.user, profile: profileData } }
  } catch (error: any) {
    console.error("Unexpected error getting current user:", error)
    return { user: null, error: error.message || "An unexpected error occurred" }
  }
}

// Helper functions for resume templates
export const getResumeTemplates = async (isPremium?: boolean) => {
  try {
    const supabase = createSupabaseClient()

    let query = supabase.from("resume_templates").select("*")

    if (isPremium !== undefined) {
      query = query.eq("is_premium", isPremium)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching resume templates:", error)
      return []
    }

    return data as ResumeTemplate[]
  } catch (error) {
    console.error("Unexpected error fetching resume templates:", error)
    return []
  }
}

export const getResumeTemplate = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("resume_templates").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching resume template:", error)
      return null
    }

    return data as ResumeTemplate
  } catch (error) {
    console.error("Unexpected error fetching resume template:", error)
    return null
  }
}

// Helper functions for cover letter templates
export const getCoverLetterTemplates = async (isPremium?: boolean) => {
  try {
    const supabase = createSupabaseClient()

    let query = supabase.from("cover_letter_templates").select("*")

    if (isPremium !== undefined) {
      query = query.eq("is_premium", isPremium)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching cover letter templates:", error)
      return []
    }

    return data as CoverLetterTemplate[]
  } catch (error) {
    console.error("Unexpected error fetching cover letter templates:", error)
    return []
  }
}

export const getCoverLetterTemplate = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("cover_letter_templates").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching cover letter template:", error)
      return null
    }

    return data as CoverLetterTemplate
  } catch (error) {
    console.error("Unexpected error fetching cover letter template:", error)
    return null
  }
}

// Helper functions for user resumes
export const getUserResumes = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("resumes")
      .select("*, resume_templates(*)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching user resumes:", error)
      return []
    }

    return data as (Resume & { resume_templates: ResumeTemplate | null })[]
  } catch (error) {
    console.error("Unexpected error fetching user resumes:", error)
    return []
  }
}

export const getResume = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("resumes").select("*, resume_templates(*)").eq("id", id).single()

    if (error) {
      console.error("Error fetching resume:", error)
      return null
    }

    return data as Resume & { resume_templates: ResumeTemplate | null }
  } catch (error) {
    console.error("Unexpected error fetching resume:", error)
    return null
  }
}

export const saveResume = async (resume: Omit<Resume, "id" | "created_at" | "updated_at">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("resumes").upsert(resume).select().single()

    if (error) {
      console.error("Error saving resume:", error)
      return null
    }

    return data as Resume
  } catch (error) {
    console.error("Unexpected error saving resume:", error)
    return null
  }
}

export const deleteResume = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from("resumes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting resume:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting resume:", error)
    return false
  }
}

// Helper functions for user cover letters
export const getUserCoverLetters = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("cover_letters")
      .select("*, cover_letter_templates(*)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching user cover letters:", error)
      return []
    }

    return data as (CoverLetter & { cover_letter_templates: CoverLetterTemplate | null })[]
  } catch (error) {
    console.error("Unexpected error fetching user cover letters:", error)
    return []
  }
}

export const getCoverLetter = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("cover_letters")
      .select("*, cover_letter_templates(*)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching cover letter:", error)
      return null
    }

    return data as CoverLetter & { cover_letter_templates: CoverLetterTemplate | null }
  } catch (error) {
    console.error("Unexpected error fetching cover letter:", error)
    return null
  }
}

export const saveCoverLetter = async (coverLetter: Omit<CoverLetter, "id" | "created_at" | "updated_at">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("cover_letters").upsert(coverLetter).select().single()

    if (error) {
      console.error("Error saving cover letter:", error)
      return null
    }

    return data as CoverLetter
  } catch (error) {
    console.error("Unexpected error saving cover letter:", error)
    return null
  }
}

export const deleteCoverLetter = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from("cover_letters").delete().eq("id", id)

    if (error) {
      console.error("Error deleting cover letter:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting cover letter:", error)
    return false
  }
}

// Helper functions for job applications
export const getUserJobApplications = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, resume:resume_id(*), cover_letter:cover_letter_id(*)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching job applications:", error)
      return []
    }

    return data as (JobApplication & {
      resume: Resume | null
      cover_letter: CoverLetter | null
    })[]
  } catch (error) {
    console.error("Unexpected error fetching job applications:", error)
    return []
  }
}

export const getJobApplication = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*, resume:resume_id(*), cover_letter:cover_letter_id(*)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching job application:", error)
      return null
    }

    return data as JobApplication & {
      resume: Resume | null
      cover_letter: CoverLetter | null
    }
  } catch (error) {
    console.error("Unexpected error fetching job application:", error)
    return null
  }
}

export const saveJobApplication = async (jobApplication: Omit<JobApplication, "id" | "created_at" | "updated_at">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("job_applications").upsert(jobApplication).select().single()

    if (error) {
      console.error("Error saving job application:", error)
      return null
    }

    return data as JobApplication
  } catch (error) {
    console.error("Unexpected error saving job application:", error)
    return null
  }
}

export const deleteJobApplication = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase.from("job_applications").delete().eq("id", id)

    if (error) {
      console.error("Error deleting job application:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting job application:", error)
    return false
  }
}

// Helper functions for user profile
export const getUserProfile = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error)
    return null
  }
}

export const updateUserProfile = async (profile: Partial<Profile> & { id: string }) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("profiles").update(profile).eq("id", profile.id).select().single()

    if (error) {
      console.error("Error updating user profile:", error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error("Unexpected error updating user profile:", error)
    return null
  }
}

// Helper functions for file uploads
export const uploadFile = async (userId: string, file: File) => {
  try {
    const supabase = createSupabaseClient()

    // Generate a unique filename
    const timestamp = new Date().getTime()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${timestamp}.${fileExt}`

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage.from("user_files").upload(fileName, file)

    if (storageError) {
      console.error("Error uploading file:", storageError)
      return { error: storageError }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("user_files").getPublicUrl(fileName)

    // Insert file record
    const { data, error } = await supabase
      .from("user_files")
      .insert([
        {
          user_id: userId,
          filename: fileName,
          original_filename: file.name,
          file_path: publicUrlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving file record:", error)
      return { error }
    }

    return { data }
  } catch (error: any) {
    console.error("Unexpected error uploading file:", error)
    return { error: { message: error.message || "An unexpected error occurred" } }
  }
}

export const getUserFiles = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user files:", error)
      return []
    }

    return data as UserFile[]
  } catch (error) {
    console.error("Unexpected error fetching user files:", error)
    return []
  }
}

export const deleteFile = async (id: string) => {
  try {
    const supabase = createSupabaseClient()

    // First get the file to get the filename
    const { data: fileData, error: fileError } = await supabase
      .from("user_files")
      .select("filename")
      .eq("id", id)
      .single()

    if (fileError) {
      console.error("Error fetching file:", fileError)
      return false
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("user_files").remove([fileData.filename])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      return false
    }

    // Delete record
    const { error } = await supabase.from("user_files").delete().eq("id", id)

    if (error) {
      console.error("Error deleting file record:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting file:", error)
    return false
  }
}

// Helper functions for payments
export const createPayment = async (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("payments").insert([payment]).select().single()

    if (error) {
      console.error("Error creating payment:", error)
      return null
    }

    return data as Payment
  } catch (error) {
    console.error("Unexpected error creating payment:", error)
    return null
  }
}

export const updatePaymentStatus = async (id: string, status: Payment["payment_status"], transactionId?: string) => {
  try {
    const supabase = createSupabaseClient()

    const updateData: Partial<Payment> = { payment_status: status }
    if (transactionId) {
      updateData.transaction_id = transactionId
    }

    const { data, error } = await supabase.from("payments").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating payment status:", error)
      return null
    }

    return data as Payment
  } catch (error) {
    console.error("Unexpected error updating payment status:", error)
    return null
  }
}

// Helper functions for subscriptions
export const createSubscription = async (subscription: Omit<Subscription, "id" | "created_at" | "updated_at">) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.from("subscriptions").insert([subscription]).select().single()

    if (error) {
      console.error("Error creating subscription:", error)
      return null
    }

    // Update user's subscription tier
    await supabase
      .from("profiles")
      .update({
        subscription_tier: subscription.plan_name.toLowerCase(),
        subscription_expires_at: subscription.end_date,
      })
      .eq("id", subscription.user_id)

    return data as Subscription
  } catch (error) {
    console.error("Unexpected error creating subscription:", error)
    return null
  }
}

export const getUserSubscription = async (userId: string) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No active subscription found
        return null
      }
      console.error("Error fetching user subscription:", error)
      return null
    }

    return data as Subscription
  } catch (error) {
    console.error("Unexpected error fetching user subscription:", error)
    return null
  }
}

