export interface InterviewQuestion {
  question: string
  context?: string
  difficulty?: "easy" | "medium" | "hard"
  category?: string
  suggestedAnswer?: string
}

export interface AtsAnalysisResult {
  score: number
  missingKeywords: string[]
  suggestions: string[]
  formattingIssues?: string[]
}

export interface AIUsageRecord {
  id?: string
  user_id: string
  feature_name: string
  tokens_used: number
  model_used: string
  timestamp?: string
  created_at?: string
}

export interface AIModelConfig {
  name: string
  provider: "google" | "openai" | "anthropic"
  maxTokens: number
  temperature: number
  costPer1KTokens: number
}

export const AI_MODELS = {
  GEMINI_FLASH: {
    name: "gemini-2.0-flash",
    provider: "google",
    maxTokens: 8192,
    temperature: 0.7,
    costPer1KTokens: 0.0001,
  },
  GEMINI_PRO: {
    name: "gemini-1.5-pro-latest",
    provider: "google",
    maxTokens: 32768,
    temperature: 0.7,
    costPer1KTokens: 0.0005,
  },
} as const
