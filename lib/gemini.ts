import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn("GEMINI_API_KEY environment variable is not set")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export const generateCoverLetter = async (
  userInfo: any,
  jobTitle: string,
  companyName: string,
  jobDescription?: string,
) => {
  // Mock implementation for when Gemini is not configured
  if (!genAI) {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background in ${userInfo.skills || "relevant technologies"}, I am confident that I would be a valuable addition to your team.

${jobDescription ? `After reviewing the job description, I am particularly excited about the opportunity to contribute to ${companyName}'s mission and work with the technologies mentioned in the posting.` : ""}

My experience includes:
• Strong technical skills in ${userInfo.skills || "various technologies"}
• Proven track record of delivering high-quality results
• Excellent communication and collaboration abilities

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to ${companyName}'s continued success. Thank you for considering my application.

Best regards,
${userInfo.name || "Your Name"}`
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Generate a professional cover letter for:
      Job Title: ${jobTitle}
      Company: ${companyName}
      User Info: ${JSON.stringify(userInfo)}
      ${jobDescription ? `Job Description: ${jobDescription}` : ""}
      
      Create a compelling cover letter that:
      - Is personalized to the specific role and company
      - Highlights relevant experience and skills
      - Shows enthusiasm for the position
      - Is professional and well-structured
      - Is approximately 3-4 paragraphs long
      
      Format it as a proper business letter without the header (name/address) as that will be added separately.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw new Error("Failed to generate cover letter. Please try again.")
  }
}

export const generateProfessionalSummary = async (userInfo: any) => {
  if (!genAI) {
    return `Experienced professional with expertise in ${userInfo.skills?.slice(0, 3).join(", ") || "various technologies"}. Proven track record of delivering results and contributing to team success. Passionate about continuous learning and professional growth.`
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Generate a professional summary for a resume based on:
      User Info: ${JSON.stringify(userInfo)}
      
      Create a compelling 2-3 sentence professional summary that:
      - Highlights key skills and experience
      - Shows value proposition
      - Is concise and impactful
      - Uses action-oriented language
      
      Return only the summary text, no additional formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating professional summary:", error)
    throw new Error("Failed to generate professional summary. Please try again.")
  }
}

export const generateWorkDescription = async (jobTitle: string, company: string) => {
  if (!genAI) {
    return `• Led key initiatives and projects at ${company}
• Collaborated with cross-functional teams to deliver results
• Implemented best practices and improved processes
• Contributed to team goals and company objectives`
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Generate a professional work description for:
      Job Title: ${jobTitle}
      Company: ${company}
      
      Create 3-4 bullet points that:
      - Use strong action verbs
      - Show measurable impact where possible
      - Are relevant to the job title
      - Follow resume best practices
      
      Return only the bullet points with • symbols, no additional text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating work description:", error)
    throw new Error("Failed to generate work description. Please try again.")
  }
}

export const generateSkillsSuggestions = async (userInfo: any) => {
  if (!genAI) {
    const baseSkills = ["Communication", "Problem Solving", "Teamwork", "Leadership", "Project Management"]
    return baseSkills.join(", ")
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Suggest relevant skills based on:
      User Info: ${JSON.stringify(userInfo)}
      
      Suggest 5-8 relevant skills that:
      - Are relevant to their experience and education
      - Include both technical and soft skills
      - Are commonly sought after in their field
      - Complement their existing skills
      
      Return only the skills as a comma-separated list, no additional text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating skills suggestions:", error)
    throw new Error("Failed to generate skills suggestions. Please try again.")
  }
}

export const generateResumeContent = async (userInfo: any, jobDescription?: string) => {
  if (!genAI) {
    throw new Error("Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    Generate a professional resume content based on the following information:
    User Info: ${JSON.stringify(userInfo)}
    ${jobDescription ? `Job Description: ${jobDescription}` : ""}
    
    Please provide a well-structured resume with sections for:
    - Professional Summary
    - Work Experience
    - Skills
    - Education
    - Achievements
    
    Format the response as JSON with clear sections.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export const generateInterviewQuestions = async (jobTitle: string, industry: string, experienceLevel: string) => {
  if (!genAI) {
    throw new Error("Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    Generate 10 relevant interview questions for:
    Job Title: ${jobTitle}
    Industry: ${industry}
    Experience Level: ${experienceLevel}
    
    Include a mix of:
    - Technical questions
    - Behavioral questions
    - Situational questions
    
    Format as JSON array with question and suggested answer approach.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export const analyzeInterviewResponse = async (question: string, userResponse: string) => {
  if (!genAI) {
    throw new Error("Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    Analyze this interview response:
    Question: ${question}
    Response: ${userResponse}
    
    Provide feedback on:
    - Content quality
    - Structure
    - Areas for improvement
    - Score out of 10
    
    Be constructive and helpful.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
