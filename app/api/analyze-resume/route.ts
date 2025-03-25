import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, jobDescription } = await request.json()

    if (!resumeContent) {
      return NextResponse.json({ error: "Resume content is required" }, { status: 400 })
    }

    const analysis = await aiService.gemini.analyzeResume(resumeContent, jobDescription)

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 })
  }
}

