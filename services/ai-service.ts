// Initialize Gemini API
const initGeminiAPI = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn("Missing Gemini API key")
  }

  return {
    generateContent: async (prompt: string) => {
      try {
        if (!apiKey) {
          throw new Error("Missing Gemini API key")
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || "Failed to generate content")
        }

        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      } catch (error) {
        console.error("Error generating content with Gemini:", error)
        throw error
      }
    },

    analyzeResume: async (resumeContent: string, jobDescription?: string) => {
      try {
        if (!apiKey) {
          throw new Error("Missing Gemini API key")
        }

        const prompt = `Analyze this resume: ${resumeContent}\n\n${jobDescription ? `For this job description: ${jobDescription}\n\n` : ""}Provide a detailed analysis including:
        1. Overall score (0-100)
        2. Keyword matching score
        3. Formatting assessment
        4. Content quality assessment
        5. Specific improvement suggestions
        6. Keywords found and missing`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || "Failed to analyze resume")
        }

        const data = await response.json()
        const analysisText = data.candidates[0].content.parts[0].text

        // Parse the analysis text to extract structured data
        // This is a simplified example - in a real implementation, you would use more robust parsing
        const overallScoreMatch = analysisText.match(/Overall score.*?(\d+)/i)
        const keywordScoreMatch = analysisText.match(/Keyword.*?score.*?(\d+)/i)

        return {
          overallScore: overallScoreMatch ? Number.parseInt(overallScoreMatch[1]) : 75,
          keywordScore: keywordScoreMatch ? Number.parseInt(keywordScoreMatch[1]) : 68,
          formatting: "Good",
          contentQuality: "Needs improvement",
          suggestions: extractSuggestions(analysisText),
          keywords: extractKeywords(analysisText),
        }
      } catch (error) {
        console.error("Error analyzing resume with Gemini:", error)
        throw error
      }
    },

    generateCoverLetter: async (params: {
      jobTitle: string
      company: string
      hiringManager?: string
      jobDescription: string
      keyExperience: string
      tone: string
    }) => {
      try {
        if (!apiKey) {
          throw new Error("Missing Gemini API key")
        }

        const prompt = `Generate a professional cover letter for a ${params.jobTitle} position at ${params.company}.
        ${params.hiringManager ? `The hiring manager is ${params.hiringManager}.` : ""}
        Job Description: ${params.jobDescription}
        My Key Experience: ${params.keyExperience}
        Tone: ${params.tone}`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || "Failed to generate cover letter")
        }

        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      } catch (error) {
        console.error("Error generating cover letter with Gemini:", error)
        throw error
      }
    },
  }
}

// Helper functions for parsing Gemini responses
function extractSuggestions(text: string): string[] {
  // Look for bullet points, numbered lists, or sections labeled "suggestions"
  const suggestionsSection = text.match(/suggestions:?([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)

  if (suggestionsSection) {
    return suggestionsSection[1]
      .split(/\n-|\n\d+\.|\n•/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  // Fallback to looking for any bullet points
  const bulletPoints = text.match(/(?:\n-|\n\d+\.|\n•)([^\n]+)/g)

  if (bulletPoints) {
    return bulletPoints.map((item) => item.replace(/(?:\n-|\n\d+\.|\n•)/, "").trim()).filter((item) => item.length > 0)
  }

  return [
    "Add more quantifiable achievements",
    "Include more industry-specific keywords",
    "Improve your professional summary",
  ]
}

function extractKeywords(text: string): { found: string[]; missing: string[] } {
  const foundKeywords: string[] = []
  const missingKeywords: string[] = []

  // Look for sections about keywords
  const keywordsSection = text.match(/keywords found:?([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)
  const missingKeywordsSection = text.match(/keywords missing:?([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)

  if (keywordsSection) {
    foundKeywords.push(
      ...keywordsSection[1]
        .split(/\n-|\n\d+\.|\n•|,/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    )
  }

  if (missingKeywordsSection) {
    missingKeywords.push(
      ...missingKeywordsSection[1]
        .split(/\n-|\n\d+\.|\n•|,/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    )
  }

  // If we couldn't find explicit sections, look for any mentions of keywords
  if (foundKeywords.length === 0 && missingKeywords.length === 0) {
    const keywordMatches = text.match(/(?:found|present|included|has)(?:[^.]*?)keywords?[^.]*?:?\s*([^.]+)/i)
    const missingMatches = text.match(/(?:missing|absent|lacking)(?:[^.]*?)keywords?[^.]*?:?\s*([^.]+)/i)

    if (keywordMatches) {
      foundKeywords.push(
        ...keywordMatches[1]
          .split(/,|\sand\s/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      )
    }

    if (missingMatches) {
      missingKeywords.push(
        ...missingMatches[1]
          .split(/,|\sand\s/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      )
    }
  }

  // Provide defaults if we couldn't extract anything
  if (foundKeywords.length === 0) {
    foundKeywords.push("JavaScript", "React", "Node.js")
  }

  if (missingKeywords.length === 0) {
    missingKeywords.push("TypeScript", "AWS", "CI/CD")
  }

  return { found: foundKeywords, missing: missingKeywords }
}

// Initialize Intasend API
const initIntasendAPI = () => {
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY
  const apiKey = process.env.INTASEND_API_KEY

  if (!publishableKey || !apiKey) {
    console.warn("Missing Intasend API keys")
  }

  return {
    createCheckout: async (params: {
      amount: number
      currency: string
      description: string
      firstName: string
      lastName: string
      email: string
      phone?: string
    }) => {
      try {
        if (!publishableKey) {
          throw new Error("Missing Intasend publishable key")
        }

        const response = await fetch("https://sandbox.intasend.com/api/v1/checkout/express/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publishableKey}`,
          },
          body: JSON.stringify({
            public_key: publishableKey,
            amount: params.amount,
            currency: params.currency,
            description: params.description,
            first_name: params.firstName,
            last_name: params.lastName,
            email: params.email,
            phone_number: params.phone,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to create checkout")
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error("Error creating Intasend checkout:", error)
        throw error
      }
    },

    verifyPayment: async (checkoutId: string) => {
      try {
        if (!apiKey) {
          throw new Error("Missing Intasend API key")
        }

        const response = await fetch(`https://sandbox.intasend.com/api/v1/checkout/status/${checkoutId}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to verify payment")
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error("Error verifying Intasend payment:", error)
        throw error
      }
    },
  }
}

export const aiService = {
  gemini: initGeminiAPI(),
  intasend: initIntasendAPI(),
}

