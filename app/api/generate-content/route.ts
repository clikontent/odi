import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { trackAIUsage } from "@/lib/gemini"

const model = google("gemini-1.5-pro-latest", {
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 500,
    })

    // Track usage
    await trackAIUsage({
      feature: "generate_content",
      tokensUsed: 500,
      userId,
    })

    return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error generating content:", error)
    return new Response(JSON.stringify({ error: error.message || "Failed to generate content" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
