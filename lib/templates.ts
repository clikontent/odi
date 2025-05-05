import { supabase } from "./supabase"
import type { ResumeTemplate, CoverLetterTemplate } from "./supabase"

export async function getResumeTemplates(): Promise<ResumeTemplate[]> {
  try {
    const { data, error } = await supabase.from("resume_templates").select("*").order("name")

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching resume templates:", error)
    return []
  }
}

export async function getCoverLetterTemplates(): Promise<CoverLetterTemplate[]> {
  try {
    const { data, error } = await supabase.from("cover_letter_templates").select("*").order("name")

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching cover letter templates:", error)
    return []
  }
}

export async function getResumeTemplateById(id: string): Promise<ResumeTemplate | null> {
  try {
    const { data, error } = await supabase.from("resume_templates").select("*").eq("id", id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching resume template:", error)
    return null
  }
}

export async function getCoverLetterTemplateById(id: string): Promise<CoverLetterTemplate | null> {
  try {
    const { data, error } = await supabase.from("cover_letter_templates").select("*").eq("id", id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching cover letter template:", error)
    return null
  }
}
