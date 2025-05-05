import { supabase } from "@/lib/supabase"

export type ActivityType =
  | "resume"
  | "cover_letter"
  | "job_application"
  | "file"
  | "profile"
  | "login"
  | "payment"
  | "page_view"
  | "button_click"
  | "form_submit"
  | "search"
  | "filter"
  | "download"
  | "share"

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "download"
  | "upload"
  | "bulk_delete"
  | "share"
  | "login"
  | "logout"
  | "click"
  | "submit"
  | "search"
  | "filter"

export interface TrackActivityParams {
  userId: string
  entityType: ActivityType
  action: ActivityAction
  entityId?: string
  details?: any
}

export async function trackActivity({ userId, entityType, action, entityId, details }: TrackActivityParams) {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: entityType,
      activity_details: {
        action,
        entity_id: entityId,
        ...details,
      },
    })

    if (error) throw error

    // Also track in analytics_events for more detailed analysis
    await trackAnalyticsEvent(userId, `${entityType}_${action}`, {
      entity_id: entityId,
      ...details,
    })

    return true
  } catch (error) {
    console.error("Error tracking activity:", error)
    return false
  }
}

export async function trackAnalyticsEvent(userId: string, eventType: string, eventData?: any) {
  try {
    let pageUrl = ""
    if (typeof window !== "undefined") {
      pageUrl = window.location.href
    }

    const { error } = await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData || {},
      page_url: pageUrl,
    })

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error tracking analytics event:", error)
    return false
  }
}

export async function getUserStats(userId: string) {
  try {
    const { data, error } = await supabase.rpc("get_user_stats", {
      user_id_param: userId,
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting user stats:", error)
    return null
  }
}

export async function getActivityTimeline(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting activity timeline:", error)
    return []
  }
}

export async function getAnalyticsData(userId: string, eventType?: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from("analytics_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting analytics data:", error)
    return []
  }
}

export async function getAnalyticsSummary(userId: string, startDate?: string, endDate?: string) {
  try {
    // In a real app, you might use a database function for this
    // For now, we'll fetch the data and calculate the summary on the client
    const events = await getAnalyticsData(userId, undefined, startDate, endDate)

    // Group events by type
    const eventsByType = events.reduce((acc: Record<string, number>, event) => {
      const { event_type } = event
      acc[event_type] = (acc[event_type] || 0) + 1
      return acc
    }, {})

    // Group events by day
    const eventsByDay = events.reduce((acc: Record<string, number>, event) => {
      const day = new Date(event.created_at).toISOString().split("T")[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByDay,
      // Add more metrics as needed
    }
  } catch (error) {
    console.error("Error getting analytics summary:", error)
    return null
  }
}
