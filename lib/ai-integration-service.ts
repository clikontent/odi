import type { JobDetails, AtsAnalysisResult, InterviewQuestion, CoverLetterData, ResumeData } from "@/types/ai-tools"
import { supabase } from "@/lib/supabaseClient"

/**
 * Analyzes a cover letter against a job description using ATS criteria
 */
export async function analyzeCoverLetterAts(
  coverLetterText: string,
  jobDescription: string,
): Promise<AtsAnalysisResult> {
  try {
    const response = await fetch("/api/analyze-cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coverLetterText,
        jobDescription,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to analyze cover letter")
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing cover letter:", error)
    throw error
  }
}

/**
 * Analyzes a resume against a job description using ATS criteria
 */
export async function analyzeResumeAts(resumeText: string, jobDescription: string): Promise<AtsAnalysisResult> {
  try {
    const response = await fetch("/api/analyze-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to analyze resume")
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing resume:", error)
    throw error
  }
}

/**
 * Generates interview questions based on job details, cover letter, and resume
 */
export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  coverLetterText?: string,
  resumeText?: string,
): Promise<InterviewQuestion[]> {
  try {
    const response = await fetch("/api/generate-interview-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobTitle,
        jobDescription,
        coverLetterText,
        resumeText,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to generate interview questions")
    }

    const data = await response.json()
    return data.questions
  } catch (error) {
    console.error("Error generating interview questions:", error)
    throw error
  }
}

/**
 * Generates a cover letter based on job details and personal info
 */
export async function generateCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  relevantExperience: string,
  skills: string[],
): Promise<string> {
  try {
    const response = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobTitle,
        companyName,
        jobDescription,
        relevantExperience,
        skills,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      \
      throw new Error(errorData.error || 'Failed to generate cover=>({}))
      throw new Error(errorData.error || "Failed to generate cover letter")
    }

    const data = await response.json()
    return data.coverLetter
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw error
  }
}

/**
 * Fetches saved cover letters for a user
 */
export async function fetchUserCoverLetters(userId: string): Promise<CoverLetterData[]> {
  try {
    const { data, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching cover letters:", error)
    throw error
  }
}

/**
 * Fetches saved resumes for a user
 */
export async function fetchUserResumes(userId: string): Promise<ResumeData[]> {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching resumes:", error)
    throw error
  }
}

/**
 * Creates a comprehensive interview preparation package based on job details, cover letter, and resume
 */
export async function createInterviewPrepPackage(
  jobDetails: JobDetails,
  coverLetterId?: string,
  resumeId?: string,
): Promise<{
  questions: InterviewQuestion[]
  jobInsights: string[]
  companyInsights: string[]
}> {
  try {
    // Fetch cover letter and resume if IDs are provided
    let coverLetterText = ""
    let resumeText = ""

    if (coverLetterId) {
      const { data, error } = await supabase.from("cover_letters").select("content").eq("id", coverLetterId).single()

      if (!error && data) {
        coverLetterText = data.content.generatedText || ""
      }
    }

    if (resumeId) {
      const { data, error } = await supabase.from("resumes").select("content").eq("id", resumeId).single()

      if (!error && data) {
        // This assumes resume content has a text representation
        resumeText = data.content.fullText || ""
      }
    }

    // Generate interview questions
    const questions = await generateInterviewQuestions(
      jobDetails.jobTitle,
      jobDetails.jobDescription,
      coverLetterText,
      resumeText,
    )

    // For now, return placeholder insights
    // In a real implementation, you would generate these with AI as well
    return {
      questions,
      jobInsights: [
        "Research the company culture and values",
        "Understand the industry trends affecting this role",
        "Prepare examples of your relevant experience",
      ],
      companyInsights: [
        "Review the company website and recent news",
        "Check their social media presence",
        "Research their competitors",
      ],
    }
  } catch (error) {
    console.error("Error creating interview prep package:", error)
    throw error
  }
}
