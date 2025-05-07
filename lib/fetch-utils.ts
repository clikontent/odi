/**
 * Safely execute a fetch request with error handling
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch data")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error)
    throw error
  }
}

/**
 * Safely execute a Supabase query with error handling
 */
export async function safeSupabaseQuery<T>(queryFn: () => Promise<{ data: T; error: any }>) {
  try {
    const { data, error } = await queryFn()

    if (error) {
      console.error("Supabase query error:", error)
      throw new Error(error.message || "Database query failed")
    }

    return data || []
  } catch (error) {
    console.error("Error executing Supabase query:", error)
    return []
  }
}

/**
 * Safely generate a cover letter with error handling
 */
export async function generateCoverLetter(formData: {
  jobTitle: string
  companyName: string
  jobDescription: string
  relevantExperience: string
  skills: string[]
}) {
  try {
    const response = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to generate cover letter")
    }

    return await response.json()
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw error
  }
}
