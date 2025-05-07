import { supabase } from "@/lib/supabaseClient"

// Function to generate a cover letter using the API
export async function generateCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  relevantExperience: string,
  skills: string[],
  userId?: string,
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
      throw new Error(errorData.error || "Failed to generate cover letter")
    }

    const data = await response.json()

    // Log AI usage if userId is provided
    if (userId) {
      await trackAIUsage({
        userId,
        feature: "cover_letter_generation",
        tokensUsed: estimateTokens(data.coverLetter),
        modelUsed: "gemini-2.0-flash",
      })
    }

    return data.coverLetter
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw error
  }
}

// Function to analyze a resume for ATS compatibility
export async function analyzeResumeForATS(
  resumeText: string,
  jobDescription: string,
  userId?: string,
): Promise<AtsAnalysisResult> {
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

    const data = await response.json()

    // Log AI usage if userId is provided
    if (userId) {
      await trackAIUsage({
        userId,
        feature: "resume_ats_analysis",
        tokensUsed: estimateTokens(resumeText) + estimateTokens(jobDescription),
        modelUsed: "gemini-2.0-flash",
      })
    }

    return data.analysis
  } catch (error) {
    console.error("Error analyzing resume:", error)
    throw error
  }
}

// Function to generate interview questions
export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  resumeText?: string,
  coverLetterText?: string,
  userId?: string,
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
        resumeText,
        coverLetterText,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to generate interview questions")
    }

    const data = await response.json()

    // Log AI usage if userId is provided
    if (userId) {
      await trackAIUsage({
        userId,
        feature: "interview_question_generation",
        tokensUsed:
          estimateTokens(jobDescription) +
          (resumeText ? estimateTokens(resumeText) : 0) +
          (coverLetterText ? estimateTokens(coverLetterText) : 0),
        modelUsed: "gemini-2.0-flash",
      })
    }

    return data.questions
  } catch (error) {
    console.error("Error generating interview questions:", error)
    throw error
  }
}

// Function to track AI usage
interface TrackAIUsageParams {
  userId: string
  feature: string
  tokensUsed: number
  modelUsed: string
}

export async function trackAIUsage({
  userId,
  feature,
  tokensUsed,
  modelUsed = "gemini-2.0-flash",
}: TrackAIUsageParams): Promise<void> {
  try {
    const { error } = await supabase.from("ai_usage").insert({
      user_id: userId,
      feature_name: feature,
      tokens_used: tokensUsed,
      model_used: modelUsed,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking AI usage:", error)
    }
  } catch (error) {
    console.error("Error tracking AI usage:", error)
  }
}

// Helper function to estimate tokens in a text
function estimateTokens(text: string): number {
  if (!text) return 0
  // A rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Types
export interface AtsAnalysisResult {
  score: number
  missingKeywords: string[]
  suggestions: string[]
  formattingIssues?: string[]
}

export interface InterviewQuestion {
  question: string
  context?: string
  difficulty?: "easy" | "medium" | "hard"
  category?: string
  suggestedAnswer?: string
}
