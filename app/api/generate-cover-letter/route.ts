import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs" // Use Node.js runtime for better stability

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { jobTitle, companyName, jobDescription, relevantExperience, skills } = body

    // Validate required fields
    if (!jobTitle || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `
      Write a compelling and professional cover letter for the following job:

      Job Title: ${jobTitle}
      Company: ${companyName}
      Job Description: ${jobDescription || "Not provided"}

      Candidate's Relevant Experience:
      ${relevantExperience || "Not provided"}

      Candidate's Skills:
      ${Array.isArray(skills) ? skills.join(", ") : "Not provided"}

      The letter should be enthusiastic, concise, and customized for this role.
      Structure it with 3-4 paragraphs:
      1. An engaging introduction expressing interest in the position
      2. A paragraph highlighting relevant experience and skills that match the job requirements
      3. A paragraph explaining why the candidate is a good fit for the company culture
      4. A conclusion with a call to action

      Use a professional tone throughout.
    `

    // Initialize Google Generative AI with error handling
    let genAI
    try {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    } catch (error) {
      console.error("Error initializing Google Generative AI:", error)
      return NextResponse.json({ error: "Failed to initialize AI service" }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    console.log("Sending prompt to Gemini API...")

    // Generate content with timeout
    let result
    try {
      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out")), 30000) // 30 second timeout
      })

      result = await Promise.race([model.generateContent(prompt), timeoutPromise])
    } catch (error) {
      console.error("Error generating content:", error)
      return NextResponse.json(
        {
          error: "Failed to generate cover letter",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Extract text with error handling
    let text
    try {
      text = result.response.text()
    } catch (error) {
      console.error("Error extracting text from response:", error)
      return NextResponse.json({ error: "Failed to process AI response" }, { status: 500 })
    }

    console.log("Received response from Gemini API")
    return NextResponse.json({ coverLetter: text })
  } catch (error) {
    console.error("Unhandled error generating cover letter:", error)
    return NextResponse.json(
      {
        error: "Failed to generate cover letter. Please try again later.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
