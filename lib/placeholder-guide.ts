// Resume Template Placeholder Guide
export const PLACEHOLDER_GUIDE = {
  personal: [
    { name: "{NAME}", description: "Your first name" },
    { name: "{SURNAME}", description: "Your last name" },
    { name: "{FULL_NAME}", description: "Your complete name" },
    { name: "{TAGLINE}", description: "Your professional tagline" },
    { name: "{CITY}", description: "City location" },
    { name: "{COUNTY}", description: "County/state location" },
    { name: "{POSTCODE}", description: "Postal/ZIP code" },
    { name: "{PHONE}", description: "Phone number" },
    { name: "{EMAIL}", description: "Email address" },
  ],
  experience: [
    { name: "{WORK_EXPERIENCE}", description: "All work experiences combined" },
    { name: "{WORK_EXPERIENCE_1}", description: "First work experience entry" },
    { name: "{WORK_EXPERIENCE_2}", description: "Second work experience entry" },
    { name: "{JOB_TITLE_1}", description: "Job title for position #1" },
    { name: "{EMPLOYER_1}", description: "Employer name for position #1" },
    { name: "{WORK_LOCATION_1}", description: "Location for position #1" },
    { name: "{WORK_START_DATE_1}", description: "Start date for position #1" },
    { name: "{WORK_END_DATE_1}", description: "End date for position #1" },
    { name: "{WORK_DESCRIPTION_1}", description: "Job description for position #1" },
    { name: "{WORK_ACHIEVEMENTS_1}", description: "Achievements for position #1" },
  ],
  education: [
    { name: "{EDUCATION}", description: "All education entries combined" },
    { name: "{EDUCATION_1}", description: "First education entry" },
    { name: "{EDUCATION_2}", description: "Second education entry" },
    { name: "{INSTITUTION_1}", description: "School/university name for education #1" },
    { name: "{EDUCATION_LOCATION_1}", description: "Location for education #1" },
    { name: "{DEGREE_1}", description: "Degree type for education #1" },
    { name: "{FIELD_OF_STUDY_1}", description: "Major/specialization for education #1" },
    { name: "{GRADUATION_DATE_1}", description: "Graduation date for education #1" },
    { name: "{EDUCATION_DESCRIPTION_1}", description: "Description for education #1" },
  ],
  skills: [
    { name: "{SKILLS}", description: "All skills combined as a list" },
    { name: "{SKILL_1}", description: "First skill" },
    { name: "{SKILL_2}", description: "Second skill" },
    { name: "{SKILL_3}", description: "Third skill" },
    { name: "{ACHIEVEMENTS}", description: "All achievements combined as a list" },
    { name: "{ACHIEVEMENT_1}", description: "First achievement" },
    { name: "{ACHIEVEMENT_2}", description: "Second achievement" },
  ],
  other: [
    { name: "{PROFESSIONAL_SUMMARY}", description: "Your professional summary" },
    { name: "{CERTIFICATIONS}", description: "Certifications section" },
    { name: "{LANGUAGES}", description: "Languages section" },
    { name: "{WEBSITES}", description: "Websites, portfolios, profiles section" },
    { name: "{SOFTWARE}", description: "Software proficiency section" },
    { name: "{ACCOMPLISHMENTS}", description: "Accomplishments section" },
    { name: "{ADDITIONALINFO}", description: "Additional information section" },
    { name: "{AFFILIATIONS}", description: "Affiliations section" },
    { name: "{INTERESTS}", description: "Interests section" },
  ],
  references: [
    { name: "{REFERENCES}", description: "All references combined" },
    { name: "{REFERENCE_1}", description: "First reference entry" },
    { name: "{REFERENCE_2}", description: "Second reference entry" },
    { name: "{REFERENCE_NAME_1}", description: "Name for reference #1" },
    { name: "{REFERENCE_POSITION_1}", description: "Job position for reference #1" },
    { name: "{REFERENCE_COMPANY_1}", description: "Company for reference #1" },
    { name: "{REFERENCE_PHONE_1}", description: "Phone for reference #1" },
    { name: "{REFERENCE_EMAIL_1}", description: "Email for reference #1" },
  ],
}

// Helper function to get all placeholders by category
export const getPlaceholdersByCategory = (category: keyof typeof PLACEHOLDER_GUIDE) => {
  return PLACEHOLDER_GUIDE[category] || []
}

// Helper function to get all placeholders
export const getAllPlaceholders = () => {
  return Object.values(PLACEHOLDER_GUIDE).flat()
}

// Helper function to validate if a placeholder exists
export const isValidPlaceholder = (placeholder: string) => {
  return getAllPlaceholders().some((p) => p.name === placeholder)
}

// Helper function to replace placeholders in template
export const replacePlaceholders = (template: string, data: Record<string, any>) => {
  let result = template

  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key.toUpperCase()}}`
    if (Array.isArray(value)) {
      // Handle arrays (like skills, achievements)
      result = result.replace(new RegExp(placeholder, "g"), value.join(", "))
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects (like work experience)
      result = result.replace(new RegExp(placeholder, "g"), JSON.stringify(value))
    } else {
      result = result.replace(new RegExp(placeholder, "g"), String(value || ""))
    }
  })

  return result
}
