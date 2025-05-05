import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function generateSummary(experience: string, skills: string[]): Promise<string> {
  try {
    const prompt = `
    Based on the following work experience and skills, write a professional summary for a resume (100-150 words):
    
    Experience:
    ${experience}
    
    Skills:
    ${skills.join(", ")}
    
    The summary should highlight strengths, expertise, and career goals in a professional tone.
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 200,
    })

    await trackAIUsage("generate_summary", 200)
    return text
  } catch (error) {
    console.error("Error generating summary:", error)
    return "Failed to generate summary. Please try again or write your own."
  }
}

export async function suggestSkills(jobDescription: string, currentSkills: string[]): Promise<string[]> {
  try {
    const prompt = `
    Based on the following job description and the person's current skills, suggest 5-8 relevant skills they should add to their resume:
    
    Job Description:
    ${jobDescription}
    
    Current Skills:
    ${currentSkills.join(", ")}
    
    Return only a comma-separated list of skills, no explanations or numbering.
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 100,
    })

    await trackAIUsage("suggest_skills", 100)
    return text.split(",").map((skill) => skill.trim())
  } catch (error) {
    console.error("Error suggesting skills:", error)
    return []
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  experience: string,
  skills: string[],
): Promise<string> {
  try {
    const prompt = `
    Write a professional cover letter for a ${jobTitle} position at ${companyName}.
    
    Job Description:
    ${jobDescription}
    
    Candidate Experience:
    ${experience}
    
    Candidate Skills:
    ${skills.join(", ")}
    
    The cover letter should be formal, professional, and highlight how the candidate's experience and skills match the job requirements.
    It should be 3-4 paragraphs long and include a strong opening, relevant experience highlights, and a call to action.
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 500,
    })

    await trackAIUsage("generate_cover_letter", 500)
    return text
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return "Failed to generate cover letter. Please try again or write your own."
  }
}

export async function suggestAchievements(experience: string): Promise<string[]> {
  try {
    const prompt = `
    Based on the following work experience, suggest 3-5 quantifiable achievements that could be added to a resume:
    
    Experience:
    ${experience}
    
    Return only a list of achievements, each starting with a strong action verb and including metrics where possible.
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 200,
    })

    await trackAIUsage("suggest_achievements", 200)
    return text.split("\n").filter((line) => line.trim().length > 0)
  } catch (error) {
    console.error("Error suggesting achievements:", error)
    return []
  }
}

export async function analyzeResumeForJobMatch(
  resumeText: string,
  jobDescription: string,
): Promise<{
  score: number
  missingKeywords: string[]
  suggestions: string[]
}> {
  try {
    const prompt = `
    Analyze how well the following resume matches the job description. 
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Provide the following in JSON format:
    1. A match score from 0-100
    2. A list of important keywords from the job description missing in the resume
    3. 3-5 specific suggestions to improve the resume for this job
    
    Format your response as valid JSON with the keys: "score", "missingKeywords", and "suggestions".
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 500,
    })

    await trackAIUsage("analyze_resume", 500)

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return {
        score: 50,
        missingKeywords: ["Unable to parse keywords"],
        suggestions: ["Unable to generate suggestions. Please try again."],
      }
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return {
      score: 0,
      missingKeywords: [],
      suggestions: ["Failed to analyze resume. Please try again."],
    }
  }
}

export async function generateInterviewQuestions(jobTitle: string, jobDescription: string): Promise<string[]> {
  try {
    const prompt = `
    Generate 5 likely interview questions for a ${jobTitle} position based on this job description:
    
    ${jobDescription}
    
    Return only the questions as a numbered list, no explanations or additional text.
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt,
      maxTokens: 300,
    })

    await trackAIUsage("generate_interview_questions", 300)

    // Process the response to extract just the questions
    const questions = text
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\./) || line.trim().match(/^-/))
      .map((line) => line.replace(/^\d+\.\s*|-\s*/, "").trim())

    return questions.length > 0 ? questions : text.split("\n").filter((line) => line.trim().length > 0)
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return ["Failed to generate interview questions. Please try again."]
  }
}

export async function trackAIUsage(feature: string, tokensUsed = 0, userId?: string) {
  try {
    // If no userId is provided, try to get the current user
    if (!userId) {
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    }

    if (!userId) return // No user to track

    const { error } = await supabase.from("ai_usage").insert({
      user_id: userId,
      feature,
      tokens_used: tokensUsed,
    })

    if (error) throw error
  } catch (error) {
    console.error("Error tracking AI usage:", error)
  }
}
