// app/api/generate-cover-letter/route.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, companyName, jobDescription, relevantExperience, skills } = await req.json()

    // Prepare the AI prompt
    const prompt = `
      Write a compelling and professional cover letter for the following job:

      Job Title: ${jobTitle}
      Company: ${companyName}
      Job Description: ${jobDescription}

      Candidate’s Relevant Experience:
      ${relevantExperience}

      Candidate’s Skills:
      ${skills.join(', ')}

      The letter should be enthusiastic, concise, and customized for this role.
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ coverLetter: text })
  } catch (error) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json({ error: 'Failed to generate cover letter. Please try again later.' }, { status: 500 })
  }
}
