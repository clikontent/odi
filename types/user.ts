export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  location?: string
  job_title?: string
  bio?: string
  website?: string
  social_links?: {
    linkedin?: string
    twitter?: string
    github?: string
    facebook?: string
  }
  skills?: string[]
  created_at: string
  updated_at: string
  role: "user" | "corporate" | "admin" | "recruiter"
  company_id?: string
  subscription_tier?: "free" | "basic" | "premium" | "enterprise"
  subscription_status?: "active" | "inactive" | "trial"
  last_login?: string
}

export interface UserFile {
  id: string
  user_id: string
  name: string
  type: string
  size: number
  url: string
  path: string
  created_at: string
  updated_at: string
  is_public: boolean
  thumbnail_url?: string
  description?: string
  tags?: string[]
}

export interface UserActivity {
  id: string
  user_id: string
  action: string
  entity_type: "resume" | "cover_letter" | "job_application" | "file" | "profile" | "login" | "payment"
  entity_id?: string
  details?: any
  created_at: string
  ip_address?: string
  user_agent?: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  application_updates: boolean
  marketing_emails: boolean
  job_alerts: boolean
  two_factor_auth: boolean
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_resumes: number
  total_cover_letters: number
  total_applications: number
  total_files: number
  storage_used: number
  storage_limit: number
  last_activity?: string
}
