import { supabase } from "./supabase"
import type { ResumeTemplate } from "./types"

export const getResumeTemplates = async (includesPremium = false): Promise<ResumeTemplate[]> => {
  try {
    let query = supabase
      .from("resume_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (!includesPremium) {
      query = query.eq("is_premium", false)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching templates:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching templates:", error)
    return []
  }
}

export const getTemplateById = async (templateId: string): Promise<ResumeTemplate | null> => {
  if (!templateId) return null

  try {
    const { data, error } = await supabase
      .from("resume_templates")
      .select("*")
      .eq("id", templateId)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching template:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching template:", error)
    return null
  }
}

export const renderResumeHTML = (template: ResumeTemplate, resumeData: any): string => {
  if (!template || !template.html_template) {
    return "<html><body><p>Template not available</p></body></html>"
  }

  let html = template.html_template
  const css = template.css_styles || ""

  // Replace placeholders in HTML
  const placeholders = {
    "{{fullName}}": resumeData.personalInfo?.fullName || "[Full Name]",
    "{{email}}": resumeData.personalInfo?.email || "[Email]",
    "{{phone}}": resumeData.personalInfo?.phone || "[Phone]",
    "{{location}}": resumeData.personalInfo?.location || "[Location]",
    "{{linkedin}}": resumeData.personalInfo?.linkedin || "[LinkedIn]",
    "{{portfolio}}": resumeData.personalInfo?.portfolio || "[Portfolio]",
    "{{summary}}": resumeData.summary || "[Professional Summary]",
    "{{skills}}": Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : "[Skills]",
  }

  // Replace basic placeholders
  Object.entries(placeholders).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder, "g"), value)
  })

  // Handle experience section
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    const experienceHTML = resumeData.experience
      .map(
        (exp: any) => `
        <div class="experience-item">
          <h3>${exp.title || "[Job Title]"}</h3>
          <h4>${exp.company || "[Company]"} | ${exp.location || "[Location]"}</h4>
          <p class="duration">${exp.startDate || "[Start]"} - ${exp.current ? "Present" : exp.endDate || "[End]"}</p>
          <div class="description">${exp.description || "[Job Description]"}</div>
        </div>
      `,
      )
      .join("")
    html = html.replace("{{experience}}", experienceHTML)
  } else {
    html = html.replace("{{experience}}", "<p>[Work Experience]</p>")
  }

  // Handle education section
  if (resumeData.education && Array.isArray(resumeData.education)) {
    const educationHTML = resumeData.education
      .map(
        (edu: any) => `
        <div class="education-item">
          <h3>${edu.degree || "[Degree]"}</h3>
          <h4>${edu.school || "[School]"} | ${edu.location || "[Location]"}</h4>
          <p class="graduation">${edu.graduationDate || "[Year]"}</p>
          ${edu.gpa ? `<p class="gpa">GPA: ${edu.gpa}</p>` : ""}
          ${edu.description ? `<p class="description">${edu.description}</p>` : ""}
        </div>
      `,
      )
      .join("")
    html = html.replace("{{education}}", educationHTML)
  } else {
    html = html.replace("{{education}}", "<p>[Education]</p>")
  }

  // Handle achievements
  if (resumeData.achievements && Array.isArray(resumeData.achievements)) {
    const achievementsHTML = resumeData.achievements.map((achievement: string) => `<li>${achievement}</li>`).join("")
    html = html.replace("{{achievements}}", `<ul>${achievementsHTML}</ul>`)
  } else {
    html = html.replace("{{achievements}}", "<p>[Achievements]</p>")
  }

  // Handle certifications
  if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
    const certificationsHTML = resumeData.certifications.map((cert: string) => `<li>${cert}</li>`).join("")
    html = html.replace("{{certifications}}", `<ul>${certificationsHTML}</ul>`)
  } else {
    html = html.replace("{{certifications}}", "<p>[Certifications]</p>")
  }

  return `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `
}
