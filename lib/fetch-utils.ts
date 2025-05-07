import { supabase } from "./supabaseClient"

/**
 * Safely execute a fetch request with proper error handling
 */
export async function safeFetch<T>(url: string, options?: RequestInit, timeout = 10000): Promise<T> {
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return (await response.json()) as T
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request to ${url} timed out after ${timeout}ms`)
      }
      throw new Error(`Failed to fetch from ${url}: ${error.message}`)
    }
    throw new Error(`Unknown error fetching from ${url}`)
  }
}

/**
 * Safely execute a Supabase query with proper error handling
 */
export async function safeSupabaseQuery<T>(queryFn: () => Promise<{ data: T | null; error: any }>): Promise<T> {
  try {
    const { data, error } = await queryFn()

    if (error) {
      console.error("Supabase query error:", error)
      throw new Error(`Supabase query failed: ${error.message || "Unknown error"}`)
    }

    if (data === null) {
      throw new Error("No data returned from Supabase query")
    }

    return data
  } catch (error) {
    console.error("Error in safeSupabaseQuery:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Unknown error in Supabase query")
  }
}

/**
 * Check if the user is authenticated
 */
export async function checkAuthentication() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Authentication check error:", error)
      return false
    }

    return !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}
