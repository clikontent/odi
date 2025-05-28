export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: "free" | "premium" | "professional" | "corporate"
  status: "active" | "canceled" | "past_due"
  current_period_start: string
  current_period_end: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface UsageTracking {
  id: string
  user_id: string
  month_year: string // Format: "2024-01"
  cover_letters_generated: number
  resumes_generated: number
  ats_optimizations_used: number
  interview_sessions: number
  created_at: string
  updated_at: string
}

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "executive"
  html_template: string
  css_styles: string
  preview_image_url: string
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  template_id: string
  title: string
  content: any // JSON content with placeholders filled
  file_url?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CoverLetter {
  id: string
  user_id: string
  title: string
  content: string
  job_title?: string
  company_name?: string
  created_at: string
  updated_at: string
}

export interface JobPosting {
  id: string
  company_name: string
  job_title: string
  description: string
  requirements: string[]
  location: string
  salary_range?: string
  job_type: "full-time" | "part-time" | "contract" | "remote"
  experience_level: "entry" | "mid" | "senior" | "executive"
  is_private: boolean // For premium/professional users
  posted_date: string
  application_deadline?: string
  external_url?: string
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  job_posting_id?: string
  company_name: string
  job_title: string
  job_url?: string
  status: "applied" | "interview" | "rejected" | "offer" | "accepted"
  application_date: string
  deadline?: string
  notes?: string
  resume_id?: string
  cover_letter_id?: string
  created_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  job_application_id?: string
  session_type: "basic" | "premium" | "professional"
  questions: any[] // JSON array of questions and answers
  feedback: string
  score?: number
  duration: number
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  skills: string[]
  experience_level: "entry" | "mid" | "senior" | "executive"
  industry: string
  location: string
  phone?: string
  linkedin_url?: string
  portfolio_url?: string
  created_at: string
  updated_at: string
}

export interface ATSOptimization {
  id: string
  user_id: string
  resume_id: string
  job_description: string
  optimization_type: "basic" | "full" | "advanced"
  suggestions: any[] // JSON array of suggestions
  keyword_score: number
  ats_score: number
  created_at: string
}

// Corporate features
export interface CompanyProfile {
  id: string
  company_name: string
  description: string
  website: string
  logo_url?: string
  industry: string
  size: string
  subscription_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  company_id: string
  user_id: string
  role: "admin" | "recruiter" | "viewer"
  created_at: string
}

export interface CandidateMatch {
  id: string
  company_id: string
  job_posting_id: string
  candidate_user_id: string
  match_score: number
  ai_analysis: string
  status: "pending" | "reviewed" | "contacted" | "rejected"
  created_at: string
}
