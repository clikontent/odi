import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/services/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create a specialized prompt based on the content type
    let specializedPrompt = prompt

    switch (type) {
      case "summary":
        specializedPrompt = `Generate a professional summary for a resume based on this information: ${prompt}. Keep it concise, impactful, and focused on achievements and skills.`
        break
      case "experience":
        specializedPrompt = `Generate professional work experience bullet points for a resume based on this information: ${prompt}. Use strong action verbs, include quantifiable achievements, and highlight relevant skills.`
        break
      case "skills":
        specializedPrompt = `Generate a comprehensive list of professional skills for a resume based on this information: ${prompt}. Include both technical and soft skills relevant to the field.`
        break
      case "education":
        specializedPrompt = `Generate education section content for a resume based on this information: ${prompt}. Include degree, institution, graduation date, and relevant coursework or achievements.`
        break
    }

    const content = await aiService.gemini.generateContent(specializedPrompt)

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}

