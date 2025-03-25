import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, company, hiringManager, jobDescription, keyExperience, tone } = await request.json()

    if (!jobTitle || !company) {
      return NextResponse.json({ error: "Job title and company are required" }, { status: 400 })
    }

    const coverLetter = await aiService.gemini.generateCoverLetter({
      jobTitle,
      company,
      hiringManager,
      jobDescription,
      keyExperience,
      tone,
    })

    return NextResponse.json({ coverLetter })
  } catch (error: any) {
    console.error("Error generating cover letter:", error)
    return NextResponse.json({ error: error.message || "Failed to generate cover letter" }, { status: 500 })
  }
}

