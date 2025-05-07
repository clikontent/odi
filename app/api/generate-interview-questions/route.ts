import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { InterviewQuestion } from "@/types/ai-tools"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const { jobTitle, jobDescription, coverLetterText, resumeText } = await req.json()

    if (!jobTitle || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `
      Generate 5 personalized interview questions for a ${jobTitle} position based on this job description, 
      cover letter, and resume.
      
      Job Description:
      ${jobDescription}
      
      Cover Letter:
      ${coverLetterText || "Not provided"}
      
      Resume:
      ${resumeText || "Not provided"}
      
      For each question:
      1. Create a challenging but fair question that assesses the candidate's fit for this role
      2. Focus on skills, experience, and qualifications mentioned in the job description
      3. Include questions that probe deeper into claims made in the cover letter and resume
      4. Include a mix of behavioral, technical, and situational questions
      
      Format your response as a JSON array with objects containing:
      - "question": The interview question
      - "context": Why this question is relevant (based on job description, cover letter, or resume)
      - "difficulty": "easy", "medium", or "hard"
      - "category": The type of question (behavioral, technical, situational, etc.)
      - "suggestedAnswer": A brief outline of what a good answer might include
    `

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    // Use Gemini 2.0 Flash for faster responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const questions: InterviewQuestion[] = JSON.parse(text)
      return NextResponse.json({ questions })
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      // Fallback to simple format if JSON parsing fails
      const fallbackQuestions = text
        .split(/\d+\./)
        .filter((q) => q.trim().length > 0)
        .map((q) => ({ question: q.trim() }))

      return NextResponse.json({
        questions: fallbackQuestions,
        parsingError: true,
      })
    }
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return NextResponse.json(
      {
        error: "Failed to generate interview questions. Please try again later.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
