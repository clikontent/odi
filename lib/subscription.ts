import { supabase } from "./supabase"
import type { Subscription, UsageTracking } from "./types"

export const PLAN_LIMITS = {
  free: {
    cover_letters: 5,
    resumes: 0, // Pay per resume ($5 each)
    ats_optimizations: 1,
    interview_sessions: 3,
    job_board_access: "public",
  },
  premium: {
    cover_letters: 25,
    resumes: 5,
    ats_optimizations: 10,
    interview_sessions: 10,
    job_board_access: "public_private",
  },
  professional: {
    cover_letters: -1, // Unlimited
    resumes: 20,
    ats_optimizations: -1, // Unlimited
    interview_sessions: -1, // Unlimited
    job_board_access: "full",
  },
  corporate: {
    cover_letters: -1,
    resumes: -1,
    ats_optimizations: -1,
    interview_sessions: -1,
    job_board_access: "full",
  },
}

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  if (!userId) return null

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) return null
    return data
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}

export const getCurrentUsage = async (userId: string): Promise<UsageTracking | null> => {
  if (!userId) return null

  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // "2024-01"

    const { data, error } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", currentMonth)
      .single()

    if (error) {
      // Create new usage record for this month
      const { data: newUsage, error: createError } = await supabase
        .from("usage_tracking")
        .insert({
          user_id: userId,
          month_year: currentMonth,
          cover_letters_generated: 0,
          resumes_generated: 0,
          ats_optimizations_used: 0,
          interview_sessions: 0,
        })
        .select()
        .single()

      return createError ? null : newUsage
    }

    return data
  } catch (error) {
    console.error("Error fetching usage:", error)
    return null
  }
}

export const checkUsageLimit = async (
  userId: string,
  feature: "cover_letters" | "resumes" | "ats_optimizations" | "interview_sessions",
): Promise<{ allowed: boolean; current: number; limit: number }> => {
  if (!userId) {
    return { allowed: false, current: 0, limit: 0 }
  }

  try {
    const subscription = await getUserSubscription(userId)
    const usage = await getCurrentUsage(userId)

    const planType = subscription?.plan_type || "free"
    const limits = PLAN_LIMITS[planType]
    const limit = limits[feature as keyof typeof limits] as number

    if (!usage) {
      return { allowed: false, current: 0, limit }
    }

    const current = (usage[`${feature}_generated` as keyof UsageTracking] as number) || 0

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current, limit }
    }

    return {
      allowed: current < limit,
      current,
      limit,
    }
  } catch (error) {
    console.error("Error checking usage limit:", error)
    return { allowed: false, current: 0, limit: 0 }
  }
}

export const incrementUsage = async (
  userId: string,
  feature: "cover_letters" | "resumes" | "ats_optimizations" | "interview_sessions",
) => {
  if (!userId) return

  try {
    const currentMonth = new Date().toISOString().slice(0, 7)

    const { error } = await supabase.rpc("increment_usage", {
      p_user_id: userId,
      p_month_year: currentMonth,
      p_feature: `${feature}_generated`,
    })

    if (error) {
      console.error("Error incrementing usage:", error)
    }
  } catch (error) {
    console.error("Error incrementing usage:", error)
  }
}
