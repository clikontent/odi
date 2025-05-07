// Shared types for AI tools integration

export interface JobDetails {
  companyName: string
  jobTitle: string
  hiringManager?: string
  jobDescription: string
  requiredSkills?: string[]
  location?: string
  salary?: string
  applicationDeadline?: string
}

export interface PersonalInfo {
  fullName: string
  email?: string
  phone?: string
  address?: string
  relevantExperience?: string
  skills?: string[]
  education?: EducationEntry[]
  workExperience?: WorkExperienceEntry[]
}

export interface EducationEntry {
  institution: string
  degree: string
  fieldOfStudy?: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface WorkExperienceEntry {
  company: string
  position: string
  startDate?: string
  endDate?: string
  description?: string
  achievements?: string[]
}

export interface CoverLetterData {
  title: string
  content: string
  templateId?: string
  jobDetails: JobDetails
  personalInfo: PersonalInfo
  atsScore?: number
  improvementSuggestions?: string[]
}

export interface ResumeData {
  title: string
  sections: ResumeSection[]
  templateId?: string
  personalInfo: PersonalInfo
  atsScore?: number
  missingKeywords?: string[]
  improvementSuggestions?: string[]
}

export interface ResumeSection {
  id: string
  type: "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "custom"
  title: string
  content: string | any[] // Can be string for sections like summary or array for structured data
}

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
}
