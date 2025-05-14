// Utility functions for the placeholder system

export type PlaceholderData = {
  // Personal Information
  NAME?: string
  SURNAME?: string
  FULL_NAME?: string
  TAGLINE?: string
  CITY?: string
  COUNTY?: string
  POSTCODE?: string
  PHONE?: string
  EMAIL?: string

  // Work Experience
  WORK_EXPERIENCE?: string
  WORK_EXPERIENCE_1?: string
  WORK_EXPERIENCE_2?: string
  WORK_EXPERIENCE_3?: string
  JOB_TITLE_1?: string
  JOB_TITLE_2?: string
  JOB_TITLE_3?: string
  EMPLOYER_1?: string
  EMPLOYER_2?: string
  EMPLOYER_3?: string
  WORK_LOCATION_1?: string
  WORK_LOCATION_2?: string
  WORK_LOCATION_3?: string
  WORK_START_DATE_1?: string
  WORK_START_DATE_2?: string
  WORK_START_DATE_3?: string
  WORK_END_DATE_1?: string
  WORK_END_DATE_2?: string
  WORK_END_DATE_3?: string
  WORK_DESCRIPTION_1?: string
  WORK_DESCRIPTION_2?: string
  WORK_DESCRIPTION_3?: string
  WORK_ACHIEVEMENTS_1?: string
  WORK_ACHIEVEMENTS_2?: string
  WORK_ACHIEVEMENTS_3?: string

  // Education
  EDUCATION?: string
  EDUCATION_1?: string
  EDUCATION_2?: string
  EDUCATION_3?: string
  INSTITUTION_1?: string
  INSTITUTION_2?: string
  INSTITUTION_3?: string
  EDUCATION_LOCATION_1?: string
  EDUCATION_LOCATION_2?: string
  EDUCATION_LOCATION_3?: string
  DEGREE_1?: string
  DEGREE_2?: string
  DEGREE_3?: string
  FIELD_OF_STUDY_1?: string
  FIELD_OF_STUDY_2?: string
  FIELD_OF_STUDY_3?: string
  GRADUATION_DATE_1?: string
  GRADUATION_DATE_2?: string
  GRADUATION_DATE_3?: string
  EDUCATION_DESCRIPTION_1?: string
  EDUCATION_DESCRIPTION_2?: string
  EDUCATION_DESCRIPTION_3?: string

  // Skills & Achievements
  SKILLS?: string
  SKILL_1?: string
  SKILL_2?: string
  SKILL_3?: string
  SKILL_4?: string
  SKILL_5?: string
  SKILL_6?: string
  SKILL_7?: string
  SKILL_8?: string
  SKILL_9?: string
  SKILL_10?: string
  ACHIEVEMENTS?: string
  ACHIEVEMENT_1?: string
  ACHIEVEMENT_2?: string
  ACHIEVEMENT_3?: string
  ACHIEVEMENT_4?: string
  ACHIEVEMENT_5?: string

  // References
  REFERENCES?: string
  REFERENCE_1?: string
  REFERENCE_2?: string
  REFERENCE_NAME_1?: string
  REFERENCE_NAME_2?: string
  REFERENCE_POSITION_1?: string
  REFERENCE_POSITION_2?: string
  REFERENCE_COMPANY_1?: string
  REFERENCE_COMPANY_2?: string
  REFERENCE_PHONE_1?: string
  REFERENCE_PHONE_2?: string
  REFERENCE_EMAIL_1?: string
  REFERENCE_EMAIL_2?: string

  // Other Sections
  PROFESSIONAL_SUMMARY?: string
  CERTIFICATIONS?: string
  LANGUAGES?: string
  WEBSITES?: string
  SOFTWARE?: string
  ACCOMPLISHMENTS?: string
  ADDITIONALINFO?: string
  AFFILIATIONS?: string
  INTERESTS?: string

  // Additional placeholders can be added as needed
  [key: string]: string | undefined
}

/**
 * Converts resume data to placeholder format
 */
export function convertResumeDataToPlaceholders(resumeData: any): PlaceholderData {
  const placeholders: PlaceholderData = {}

  // Personal Information
  if (resumeData.personalInfo) {
    const { fullName, email, phone, address, linkedin, website } = resumeData.personalInfo

    if (fullName) {
      const nameParts = fullName.split(" ")
      placeholders.NAME = nameParts[0] || ""
      placeholders.SURNAME = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
      placeholders.FULL_NAME = fullName
    }

    placeholders.EMAIL = email || ""
    placeholders.PHONE = phone || ""

    if (address) {
      const addressParts = address.split(",").map((part) => part.trim())
      placeholders.CITY = addressParts[0] || ""
      placeholders.COUNTY = addressParts[1] || ""
      placeholders.POSTCODE = addressParts[2] || ""
    }
  }

  // Professional Summary
  placeholders.PROFESSIONAL_SUMMARY = resumeData.summary || ""
  placeholders.TAGLINE = resumeData.tagline || ""

  // Work Experience
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    // Combined work experience
    placeholders.WORK_EXPERIENCE = resumeData.experience
      .map(
        (exp) =>
          `${exp.position} at ${exp.company}, ${exp.location || ""} (${exp.startDate || ""} - ${exp.endDate || ""})`,
      )
      .join("\n\n")

    // Individual work experiences
    resumeData.experience.forEach((exp, index) => {
      const i = index + 1
      if (i <= 3) {
        // Support up to 3 experiences by default
        placeholders[`WORK_EXPERIENCE_${i}`] =
          `${exp.position} at ${exp.company}, ${exp.location || ""} (${exp.startDate || ""} - ${exp.endDate || ""})`
        placeholders[`JOB_TITLE_${i}`] = exp.position || ""
        placeholders[`EMPLOYER_${i}`] = exp.company || ""
        placeholders[`WORK_LOCATION_${i}`] = exp.location || ""
        placeholders[`WORK_START_DATE_${i}`] = exp.startDate || ""
        placeholders[`WORK_END_DATE_${i}`] = exp.endDate || ""
        placeholders[`WORK_DESCRIPTION_${i}`] = exp.description || ""

        if (exp.achievements && Array.isArray(exp.achievements)) {
          placeholders[`WORK_ACHIEVEMENTS_${i}`] = exp.achievements.join("\n")
        }
      }
    })
  }

  // Education
  if (resumeData.education && Array.isArray(resumeData.education)) {
    // Combined education
    placeholders.EDUCATION = resumeData.education
      .map(
        (edu) =>
          `${edu.degree} in ${edu.fieldOfStudy || ""}, ${edu.school || ""} (${edu.startDate || ""} - ${edu.endDate || ""})`,
      )
      .join("\n\n")

    // Individual education entries
    resumeData.education.forEach((edu, index) => {
      const i = index + 1
      if (i <= 3) {
        // Support up to 3 education entries by default
        placeholders[`EDUCATION_${i}`] =
          `${edu.degree} in ${edu.fieldOfStudy || ""}, ${edu.school || ""} (${edu.startDate || ""} - ${edu.endDate || ""})`
        placeholders[`INSTITUTION_${i}`] = edu.school || ""
        placeholders[`EDUCATION_LOCATION_${i}`] = edu.location || ""
        placeholders[`DEGREE_${i}`] = edu.degree || ""
        placeholders[`FIELD_OF_STUDY_${i}`] = edu.fieldOfStudy || ""
        placeholders[`GRADUATION_DATE_${i}`] = edu.endDate || ""
        placeholders[`EDUCATION_DESCRIPTION_${i}`] = edu.description || ""
      }
    })
  }

  // Skills
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    // Combined skills
    placeholders.SKILLS = resumeData.skills.map((skill: any) => skill.name).join(", ")

    // Individual skills
    resumeData.skills.forEach((skill: any, index: number) => {
      const i = index + 1
      if (i <= 10) {
        // Support up to 10 skills by default
        placeholders[`SKILL_${i}`] = skill.name || ""
      }
    })
  }

  // Projects can be added as achievements
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    const achievements = resumeData.projects.map(
      (project: any) => `${project.name}: ${project.description} (${project.technologies || ""})`,
    )

    placeholders.ACHIEVEMENTS = achievements.join("\n\n")

    achievements.forEach((achievement, index) => {
      const i = index + 1
      if (i <= 5) {
        // Support up to 5 achievements by default
        placeholders[`ACHIEVEMENT_${i}`] = achievement
      }
    })
  }

  // Languages
  if (resumeData.languages && Array.isArray(resumeData.languages)) {
    placeholders.LANGUAGES = resumeData.languages.map((lang: any) => `${lang.language}: ${lang.proficiency}`).join(", ")
  }

  return placeholders
}

/**
 * Applies placeholders to a template
 */
export function applyPlaceholdersToTemplate(template: string, placeholders: PlaceholderData): string {
  let result = template

  // Replace all placeholders
  for (const [key, value] of Object.entries(placeholders)) {
    if (value) {
      const regex = new RegExp(`{${key}}`, "g")
      result = result.replace(regex, value)
    }
  }

  // Remove any unused placeholders
  result = result.replace(/{[A-Z_0-9]+}/g, "")

  return result
}

/**
 * Generates HTML content from resume data and template
 */
export function generateResumeHtml(resumeData: any, templateHtml: string): string {
  const placeholders = convertResumeDataToPlaceholders(resumeData)
  return applyPlaceholdersToTemplate(templateHtml, placeholders)
}
