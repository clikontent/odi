// Fix the import path by removing the extension
import { supabase } from "./supabase"

export { supabase }

// Also re-export other types and utilities for convenience
export type {
  Profile,
  ResumeTemplate,
  CoverLetterTemplate,
  Resume,
  CoverLetter,
  JobApplication,
  UserFile,
  Payment,
  Subscription,
  ActivityLog,
  Feedback,
  AIUsage,
} from "./supabase"

export { ensureStorageBuckets } from "./supabase"
