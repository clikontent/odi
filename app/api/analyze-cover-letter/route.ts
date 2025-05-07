import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { AtsAnalysisResult } from "@/types/ai-tools"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const { coverLetterText, jobDescription } = await req.json()

    if (!coverLetterText || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `
      Analyze how well the following cover letter matches the job description. 
      
      Cover Letter:
      ${coverLetterText}
      
      Job Description:
      ${jobDescription}
      
      Provide the following in JSON format:
      1. A match score from 0-100
      2. A list of important keywords from the job description missing in the cover letter
      3. 3-5 specific suggestions to improve the cover letter for this job
      
      Format your response as valid JSON with the keys: "score", "missingKeywords", and "suggestions".
    `

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const analysisResult: AtsAnalysisResult = JSON.parse(text)
      return NextResponse.json(analysisResult)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({
        score: 50,
        missingKeywords: ["Unable to parse keywords"],
        suggestions: ["Unable to generate suggestions. Please try again."],
      })
    }
  } catch (error) {
    console.error("Error analyzing cover letter:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze cover letter. Please try again later.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
