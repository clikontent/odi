"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import {
  Download,
  Save,
  FileIcon,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateSummary, suggestSkills, suggestAchievements } from "@/lib/gemini"
import { useUser } from "@/contexts/user-context"

interface PlaceholderResumeBuilderProps {
  templateHtml: string
  templateCss: string
  onSave: (html: string, resumeData: ResumeData) => void
}

// Define resume data structure
interface PersonalInfo {
  firstName: string
  lastName: string
  tagline: string
  city: string
  county: string
  postcode: string
  phone: string
  email: string
}

interface WorkExperience {
  id: string
  jobTitle: string
  employer: string
  location: string
  startDate: string
  endDate: string
  currentlyWorkHere: boolean
  description: string
  responsibilities: string[]
}

interface Education {
  id: string
  institution: string
  location: string
  degree: string
  fieldOfStudy: string
  graduationDate: string
  description: string
}

interface Reference {
  id: string
  name: string
  phone: string
  email: string
  position: string
  company: string
}

interface ExtraSection {
  id: string
  type:
    | "websites"
    | "certifications"
    | "languages"
    | "software"
    | "accomplishments"
    | "additionalInfo"
    | "affiliations"
    | "interests"
  title: string
  items: string[]
}

interface ResumeData {
  personalInfo: PersonalInfo
  workExperiences: WorkExperience[]
  educations: Education[]
  skills: string[]
  summary: string
  references: Reference[]
  extraSections: ExtraSection[]
}

// AI Suggestion Card Component
const SuggestionCard = ({ suggestion, onAdd }: { suggestion: string; onAdd: () => void }) => {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <p className="text-sm">{suggestion}</p>
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main component
const PlaceholderResumeBuilder = ({ templateHtml, templateCss, onSave }: PlaceholderResumeBuilderProps) => {
  const { user, profile } = useUser()

  // State for resume data
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      tagline: "Experienced Software Engineer",
      city: "Nairobi",
      county: "Nairobi County",
      postcode: "00100",
      phone: "+254 712 345 678",
      email: "john.doe@example.com",
    },
    workExperiences: [
      {
        id: "1",
        jobTitle: "Senior Software Engineer",
        employer: "Tech Solutions Ltd",
        location: "Nairobi, Kenya",
        startDate: "2020-01",
        endDate: "",
        currentlyWorkHere: true,
        description:
          "Leading development of enterprise web applications using React, Node.js, and AWS. Managing a team of 5 developers and coordinating with product managers to deliver high-quality software solutions.",
        responsibilities: [
          "Reduced application load time by 40% through code optimization",
          "Implemented CI/CD pipeline that reduced deployment time by 60%",
          "Led migration from monolith to microservices architecture",
        ],
      },
      {
        id: "2",
        jobTitle: "Software Developer",
        employer: "Digital Innovations",
        location: "Mombasa, Kenya",
        startDate: "2017-06",
        endDate: "2019-12",
        currentlyWorkHere: false,
        description:
          "Developed and maintained web applications for clients in the finance and healthcare sectors. Worked with JavaScript, PHP, and MySQL.",
        responsibilities: [
          "Developed a patient management system that improved record retrieval by 75%",
          "Created custom reporting tools that saved clients 10+ hours per week",
        ],
      },
    ],
    educations: [
      {
        id: "1",
        institution: "University of Nairobi",
        location: "Nairobi, Kenya",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        graduationDate: "2017-05",
        description:
          "Graduated with First Class Honors. Specialized in software engineering and artificial intelligence.",
      },
    ],
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "TypeScript",
      "AWS",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Agile Methodologies",
      "System Design",
    ],
    summary:
      "Experienced software engineer with over 5 years of expertise in full-stack development. Specialized in building scalable web applications using modern JavaScript frameworks and cloud technologies. Proven track record of leading development teams and delivering high-quality software solutions that meet business objectives.",
    references: [
      {
        id: "1",
        name: "Jane Smith",
        phone: "+254 723 456 789",
        email: "jane.smith@techsolutions.com",
        position: "CTO",
        company: "Tech Solutions Ltd",
      },
    ],
    extraSections: [
      {
        id: "1",
        type: "certifications",
        title: "Certifications",
        items: ["AWS Certified Solutions Architect", "Google Cloud Professional Developer", "Certified Scrum Master"],
      },
    ],
  })

  // State for current section
  const [currentSection, setCurrentSection] = useState<string>("personal")

  // State for AI suggestions
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])
  const [responsibilitySuggestions, setResponsibilitySuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  // State for completion status
  const [isComplete, setIsComplete] = useState(true)

  // State for preview
  const [previewHtml, setPreviewHtml] = useState<string>("")

  // State for UI controls
  const [zoomLevel, setZoomLevel] = useState(0.9) // Reduced from 1 to 0.9 to fix overflow
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fullscreenPreview, setFullscreenPreview] = useState(false)
  const [showPlaceholderInfo, setShowPlaceholderInfo] = useState(false)

  // State for payment status
  const [hasPaid, setHasPaid] = useState(false)

  // Check if user has premium subscription
  useEffect(() => {
    if (profile && profile.subscription_tier && profile.subscription_tier !== "free") {
      setHasPaid(true)
    }
  }, [profile])

  // Check completion status
  useEffect(() => {
    const { personalInfo, workExperiences, educations, skills } = resumeData

    const isPersonalComplete =
      personalInfo.firstName &&
      personalInfo.lastName &&
      personalInfo.tagline &&
      personalInfo.city &&
      personalInfo.phone &&
      personalInfo.email

    const isWorkComplete =
      workExperiences.length > 0 &&
      workExperiences[0].jobTitle &&
      workExperiences[0].employer &&
      workExperiences[0].location &&
      workExperiences[0].startDate

    const isEducationComplete =
      educations.length > 0 && educations[0].institution && educations[0].degree && educations[0].graduationDate

    const isSkillsComplete = skills.length > 0

    setIsComplete(isPersonalComplete && isWorkComplete && isEducationComplete && isSkillsComplete)
  }, [resumeData])

  // Generate preview HTML
  useEffect(() => {
    if (!templateHtml) return

    let html = templateHtml
    const { personalInfo, workExperiences, educations, skills, summary, references, extraSections } = resumeData

    // Replace personal info placeholders
    html = html.replace(/\{FIRST_NAME\}/g, personalInfo.firstName || "First Name")
    html = html.replace(/\{LAST_NAME\}/g, personalInfo.lastName || "Last Name")
    html = html.replace(/\{FULL_NAME\}/g, `${personalInfo.firstName || "First"} ${personalInfo.lastName || "Last"}`)
    html = html.replace(/\{TAGLINE\}/g, personalInfo.tagline || "Professional Tagline")
    html = html.replace(/\{CITY\}/g, personalInfo.city || "City")
    html = html.replace(/\{COUNTY\}/g, personalInfo.county || "County")
    html = html.replace(/\{POSTCODE\}/g, personalInfo.postcode || "Postcode")
    html = html.replace(/\{PHONE\}/g, personalInfo.phone || "Phone")
    html = html.replace(/\{EMAIL\}/g, personalInfo.email || "Email")

    // Replace summary placeholder
    html = html.replace(/\{PROFESSIONAL_SUMMARY\}/g, summary || "Professional Summary")

    // Replace work experience placeholders - individual fields
    workExperiences.forEach((exp, index) => {
      // Replace individual field placeholders for each work experience
      html = html.replace(new RegExp(`\\{JOB_TITLE_${index + 1}\\}`, "g"), exp.jobTitle || "Job Title")
      html = html.replace(new RegExp(`\\{EMPLOYER_${index + 1}\\}`, "g"), exp.employer || "Employer")
      html = html.replace(new RegExp(`\\{WORK_LOCATION_${index + 1}\\}`, "g"), exp.location || "Location")
      html = html.replace(new RegExp(`\\{WORK_START_DATE_${index + 1}\\}`, "g"), exp.startDate || "Start Date")
      html = html.replace(
        new RegExp(`\\{WORK_END_DATE_${index + 1}\\}`, "g"),
        exp.currentlyWorkHere ? "Present" : exp.endDate || "End Date",
      )
      html = html.replace(new RegExp(`\\{WORK_DESCRIPTION_${index + 1}\\}`, "g"), exp.description || "Job Description")

      // Handle work responsibilities for each position
      const responsibilitiesHtml =
        exp.responsibilities.length > 0
          ? `<ul>${exp.responsibilities.map((responsibility) => `<li>${responsibility}</li>`).join("")}</ul>`
          : ""
      html = html.replace(new RegExp(`\\{WORK_ACHIEVEMENTS_${index + 1}\\}`, "g"), responsibilitiesHtml)
    })

    // Replace education placeholders - individual fields
    educations.forEach((edu, index) => {
      // Replace individual field placeholders for each education
      html = html.replace(new RegExp(`\\{INSTITUTION_${index + 1}\\}`, "g"), edu.institution || "Institution")
      html = html.replace(new RegExp(`\\{EDUCATION_LOCATION_${index + 1}\\}`, "g"), edu.location || "Location")
      html = html.replace(new RegExp(`\\{DEGREE_${index + 1}\\}`, "g"), edu.degree || "Degree")
      html = html.replace(new RegExp(`\\{FIELD_OF_STUDY_${index + 1}\\}`, "g"), edu.fieldOfStudy || "Field of Study")
      html = html.replace(
        new RegExp(`\\{GRADUATION_DATE_${index + 1}\\}`, "g"),
        edu.graduationDate || "Graduation Date",
      )
      html = html.replace(new RegExp(`\\{EDUCATION_DESCRIPTION_${index + 1}\\}`, "g"), edu.description || "")
    })

    // Replace reference placeholders - individual fields
    references.forEach((ref, index) => {
      // Replace individual field placeholders for each reference
      html = html.replace(new RegExp(`\\{REFERENCE_NAME_${index + 1}\\}`, "g"), ref.name || "Reference Name")
      html = html.replace(new RegExp(`\\{REFERENCE_POSITION_${index + 1}\\}`, "g"), ref.position || "Position")
      html = html.replace(new RegExp(`\\{REFERENCE_COMPANY_${index + 1}\\}`, "g"), ref.company || "Company")
      html = html.replace(new RegExp(`\\{REFERENCE_PHONE_${index + 1}\\}`, "g"), ref.phone || "Phone")
      html = html.replace(new RegExp(`\\{REFERENCE_EMAIL_${index + 1}\\}`, "g"), ref.email || "Email")
    })

    // Check if the template has individual work experience placeholders
    const hasIndividualWorkExp = html.includes("{WORK_EXPERIENCE_1}")

    if (hasIndividualWorkExp) {
      // Handle individual work experience placeholders (WORK_EXPERIENCE_1, WORK_EXPERIENCE_2, etc.)
      workExperiences.forEach((exp, index) => {
        const placeholderName = `{WORK_EXPERIENCE_${index + 1}}`
        const expHtml = `
          <div class="work-experience-container">
            <h3>${exp.jobTitle || "Job Title"}</h3>
            <p>${exp.employer || "Employer"} | ${exp.location || "Location"}</p>
            <p>${exp.startDate || "Start Date"} - ${exp.currentlyWorkHere ? "Present" : exp.endDate || "End Date"}</p>
            <div class="work-description">
              <p>${exp.description || "Job Description"}</p>
              ${
                exp.responsibilities.length > 0
                  ? `
                <ul class="responsibilities-list">
                  ${exp.responsibilities.map((responsibility) => `<li>${responsibility}</li>`).join("")}
                </ul>
              `
                  : ""
              }
            </div>
          </div>
        `
        html = html.replace(placeholderName, expHtml)
      })

      // Clear any unused work experience placeholders
      html = html.replace(/\{WORK_EXPERIENCE_\d+\}/g, "")
    } else if (html.includes("{WORK_EXPERIENCE}")) {
      // Handle the single work experience placeholder that contains all experiences
      let workExperienceHtml = ""
      workExperiences.forEach((exp, index) => {
        workExperienceHtml += `
          <div class="work-experience-container">
            <h3>${exp.jobTitle || "Job Title"}</h3>
            <p>${exp.employer || "Employer"} | ${exp.location || "Location"}</p>
            <p>${exp.startDate || "Start Date"} - ${exp.currentlyWorkHere ? "Present" : exp.endDate || "End Date"}</p>
            <div class="work-description">
              <p>${exp.description || "Job Description"}</p>
              ${
                exp.responsibilities.length > 0
                  ? `
                <ul class="responsibilities-list">
                  ${exp.responsibilities.map((responsibility) => `<li>${responsibility}</li>`).join("")}
                </ul>
              `
                  : ""
              }
            </div>
          </div>
          ${index < workExperiences.length - 1 ? "<hr class='section-divider'>" : ""}
        `
      })
      html = html.replace(/\{WORK_EXPERIENCE\}/g, workExperienceHtml)
    }

    // Check if the template has individual education placeholders
    const hasIndividualEducation = html.includes("{EDUCATION_1}")

    if (hasIndividualEducation) {
      // Handle individual education placeholders (EDUCATION_1, EDUCATION_2, etc.)
      educations.forEach((edu, index) => {
        const placeholderName = `{EDUCATION_${index + 1}}`
        const eduHtml = `
          <div class="education-container">
            <h3>${edu.degree || "Degree"} in ${edu.fieldOfStudy || "Field of Study"}</h3>
            <p>${edu.institution || "Institution"} | ${edu.location || "Location"}</p>
            <p>${edu.graduationDate || "Graduation Date"}</p>
            <p>${edu.description || ""}</p>
          </div>
        `
        html = html.replace(placeholderName, eduHtml)
      })

      // Clear any unused education placeholders
      html = html.replace(/\{EDUCATION_\d+\}/g, "")
    } else if (html.includes("{EDUCATION}")) {
      // Handle the single education placeholder that contains all education entries
      let educationHtml = ""
      educations.forEach((edu, index) => {
        educationHtml += `
          <div class="education-container">
            <h3>${edu.degree || "Degree"} in ${edu.fieldOfStudy || "Field of Study"}</h3>
            <p>${edu.institution || "Institution"} | ${edu.location || "Location"}</p>
            <p>${edu.graduationDate || "Graduation Date"}</p>
            <p>${edu.description || ""}</p>
          </div>
          ${index < educations.length - 1 ? "<hr class='section-divider'>" : ""}
        `
      })
      html = html.replace(/\{EDUCATION\}/g, educationHtml)
    }

    // Replace skills placeholder
    if (html.includes("{SKILLS}")) {
      let skillsHtml = '<div class="skills-container"><ul class="skills-list">'
      skills.forEach((skill) => {
        skillsHtml += `<li>${skill}</li>`
      })
      skillsHtml += "</ul></div>"
      html = html.replace(/\{SKILLS\}/g, skillsHtml)
    }

    // Replace individual skills placeholders
    skills.forEach((skill, index) => {
      html = html.replace(new RegExp(`\\{SKILL_${index + 1}\\}`, "g"), skill)
    })

    // Check if the template has individual reference placeholders
    const hasIndividualReferences = html.includes("{REFERENCE_1}")

    if (hasIndividualReferences) {
      // Handle individual reference placeholders (REFERENCE_1, REFERENCE_2, etc.)
      references.forEach((ref, index) => {
        const placeholderName = `{REFERENCE_${index + 1}}`
        const refHtml = `
          <div class="reference-container">
            <h3>${ref.name || "Reference Name"}</h3>
            <p>${ref.position || "Position"} at ${ref.company || "Company"}</p>
            <p>Phone: ${ref.phone || "Phone"}</p>
            <p>Email: ${ref.email || "Email"}</p>
          </div>
        `
        html = html.replace(placeholderName, refHtml)
      })

      // Clear any unused reference placeholders
      html = html.replace(/\{REFERENCE_\d+\}/g, "")
    } else if (html.includes("{REFERENCES}")) {
      // Handle the single references placeholder that contains all references
      let referencesHtml = '<div class="references-container">'
      references.forEach((ref, index) => {
        referencesHtml += `
          <div class="reference-item">
            <h3>${ref.name || "Reference Name"}</h3>
            <p>${ref.position || "Position"} at ${ref.company || "Company"}</p>
            <p>Phone: ${ref.phone || "Phone"}</p>
            <p>Email: ${ref.email || "Email"}</p>
          </div>
          ${index < references.length - 1 ? "<hr class='section-divider'>" : ""}
        `
      })
      referencesHtml += "</div>"
      html = html.replace(/\{REFERENCES\}/g, referencesHtml)
    }

    // Replace extra sections placeholders
    extraSections.forEach((section) => {
      let sectionHtml = `<div class="extra-section-container"><h2>${section.title}</h2><ul class="${section.type}-list">`
      section.items.forEach((item) => {
        sectionHtml += `<li>${item}</li>`
      })
      sectionHtml += "</ul></div>"
      html = html.replace(`{${section.type.toUpperCase()}}`, sectionHtml)
    })

    // Remove any remaining placeholders
    html = html.replace(/\{[A-Z_\d]+\}/g, "")

    // Add CSS for dynamic content sizing and pagination
    const enhancedCss = `
      ${templateCss}
      
      /* Dynamic content sizing and pagination */
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .resume-container {
          page-break-inside: auto;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        .work-experience-container, .education-container, .reference-container {
          page-break-inside: avoid;
          margin-bottom: 1rem;
        }
        
        .section-divider {
          margin: 1rem 0;
          border-top: 1px solid #eee;
        }
        
        .page-break {
          page-break-before: always;
          height: 0;
          margin: 0;
          border: none;
        }
        
        ul, ol {
          page-break-inside: avoid;
        }
        
        li {
          page-break-inside: avoid;
        }
      }
      
      /* Responsive design for preview */
      .resume-container {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .work-experience-container, .education-container, .reference-container {
        margin-bottom: 1rem;
      }
      
      .work-description {
        margin-top: 0.5rem;
      }
      
      .skills-container, .references-container, .extra-section-container {
        margin-bottom: 1rem;
      }
      
      .skills-list, .responsibilities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        list-style-position: inside;
      }
      
      .skills-list li, .responsibilities-list li {
        flex: 1 1 45%;
        min-width: 200px;
      }
      
      @media (max-width: 768px) {
        .skills-list li, .responsibilities-list li {
          flex: 1 1 100%;
        }
      }
    `

    // Wrap the HTML in a container with the enhanced CSS
    const enhancedHtml = `
      <style>${enhancedCss}</style>
      <div class="resume-container">
        ${html}
      </div>
    `

    setPreviewHtml(enhancedHtml)
  }, [resumeData, templateHtml, templateCss])

  // Generate AI suggestions for skills
  const generateSkillSuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      // Extract job descriptions for context
      const jobDescriptions = resumeData.workExperiences.map((exp) => exp.description).join(" ")

      // Get current skills to avoid duplicates
      const currentSkills = resumeData.skills

      const suggestions = await suggestSkills(jobDescriptions, currentSkills)
      setSkillSuggestions(suggestions)
    } catch (error) {
      console.error("Error generating skill suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate skill suggestions",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Generate AI suggestions for responsibilities
  const generateResponsibilitySuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      // Get the selected work experience
      const selectedExp = resumeData.workExperiences[0]

      if (selectedExp && selectedExp.description) {
        const suggestions = await suggestAchievements(selectedExp.description)
        setResponsibilitySuggestions(suggestions)
      } else {
        toast({
          title: "Missing Information",
          description: "Please add job description first",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating responsibility suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate responsibility suggestions",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Generate professional summary
  const generateProfessionalSummary = async () => {
    setIsGeneratingSuggestions(true)
    try {
      // Extract work experience and skills for context
      const experience = resumeData.workExperiences
        .map((exp) => `${exp.jobTitle} at ${exp.employer}: ${exp.description}`)
        .join(" ")

      const summary = await generateSummary(experience, resumeData.skills)

      setResumeData((prev) => ({
        ...prev,
        summary,
      }))

      toast({
        title: "Summary Generated",
        description: "Professional summary has been generated successfully",
      })
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate professional summary",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Handle adding a new work experience
  const addWorkExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: [
        ...prev.workExperiences,
        {
          id: Date.now().toString(),
          jobTitle: "",
          employer: "",
          location: "",
          startDate: "",
          endDate: "",
          currentlyWorkHere: false,
          description: "",
          responsibilities: [],
        },
      ],
    }))
  }

  // Handle adding a new education
  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          id: Date.now().toString(),
          institution: "",
          location: "",
          degree: "",
          fieldOfStudy: "",
          graduationDate: "",
          description: "",
        },
      ],
    }))
  }

  // Handle adding a new reference
  const addReference = () => {
    setResumeData((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        {
          id: Date.now().toString(),
          name: "",
          phone: "",
          email: "",
          position: "",
          company: "",
        },
      ],
    }))
  }

  // Handle adding a new extra section
  const addExtraSection = (type: ExtraSection["type"], title: string) => {
    setResumeData((prev) => ({
      ...prev,
      extraSections: [
        ...prev.extraSections,
        {
          id: Date.now().toString(),
          type,
          title,
          items: [],
        },
      ],
    }))
  }

  // Handle removing a work experience
  const removeWorkExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((exp) => exp.id !== id),
    }))
  }

  // Handle removing an education
  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      educations: prev.educations.filter((edu) => edu.id !== id),
    }))
  }

  // Handle removing a reference
  const removeReference = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      references: prev.references.filter((ref) => ref.id !== id),
    }))
  }

  // Handle removing an extra section
  const removeExtraSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      extraSections: prev.extraSections.filter((section) => section.id !== id),
    }))
  }

  // Handle adding a skill
  const addSkill = (skill: string) => {
    if (!resumeData.skills.includes(skill)) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
    }
  }

  // Handle removing a skill
  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  // Handle adding a responsibility to work experience
  const addWorkResponsibility = (workId: string, responsibility: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp) => {
        if (exp.id === workId) {
          return {
            ...exp,
            responsibilities: [...exp.responsibilities, responsibility],
          }
        }
        return exp
      }),
    }))
  }

  // Handle removing a work responsibility
  const removeWorkResponsibility = (workId: string, responsibility: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp) => {
        if (exp.id === workId) {
          return {
            ...exp,
            responsibilities: exp.responsibilities.filter((r) => r !== responsibility),
          }
        }
        return exp
      }),
    }))
  }

  // Handle adding an extra section item
  const addExtraSectionItem = (sectionId: string, item: string) => {
    setResumeData((prev) => ({
      ...prev,
      extraSections: prev.extraSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [...section.items, item],
          }
        }
        return section
      }),
    }))
  }

  // Handle removing an extra section item
  const removeExtraSectionItem = (sectionId: string, item: string) => {
    setResumeData((prev) => ({
      ...prev,
      extraSections: prev.extraSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((i) => i !== item),
          }
        }
        return section
      }),
    }))
  }

  // Handle saving the resume
  const handleSave = () => {
    onSave(previewHtml, resumeData)

    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully",
    })
  }

  // Export to PDF - only available after payment
  const exportToPdf = async () => {
    if (!hasPaid) {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to a premium plan to export your resume",
        variant: "destructive",
      })
      return
    }

    try {
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default

      // Create a temporary div for the PDF content
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = previewHtml

      const opt = {
        margin: 10,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      }

      html2pdf().set(opt).from(tempDiv).save()

      toast({
        title: "PDF Exported",
        description: "Your resume has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Export to Word (DOCX) - only available after payment
  const exportToWord = async () => {
    if (!hasPaid) {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to a premium plan to export your resume",
        variant: "destructive",
      })
      return
    }

    try {
      const fileSaverModule = await import("file-saver")
      const saveAs = fileSaverModule.saveAs

      // Create a new Blob with HTML content
      const preHtml = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Resume</title>
            <style>
              ${templateCss}
              body {
                font-family: Arial, sans-serif;
              }
              
              /* Add pagination support for Word */
              @page {
                size: A4;
                margin: 2cm;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .work-experience-container, .education-container, .reference-container {
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>`
      const postHtml = `</body></html>`

      const fullHtml = preHtml + previewHtml + postHtml

      const blob = new Blob([fullHtml], { type: "application/msword" })
      saveAs(blob, "resume.doc")

      toast({
        title: "Word Document Exported",
        description: "Your resume has been exported as a Word document.",
      })
    } catch (error) {
      console.error("Error exporting to Word:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export Word document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Navigate to next section
  const nextSection = () => {
    const sections = ["personal", "work", "education", "skills", "summary", "references", "extra"]
    const currentIndex = sections.indexOf(currentSection)
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1])
    }
  }

  // Navigate to previous section
  const prevSection = () => {
    const sections = ["personal", "work", "education", "skills", "summary", "references", "extra"]
    const currentIndex = sections.indexOf(currentSection)
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1])
    }
  }

  // Render personal information form
  const renderPersonalInfoForm = () => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={resumeData.personalInfo.firstName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    firstName: e.target.value,
                  },
                }))
              }
              placeholder="First Name"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={resumeData.personalInfo.lastName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    lastName: e.target.value,
                  },
                }))
              }
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tagline">Professional Tagline *</Label>
          <Input
            id="tagline"
            value={resumeData.personalInfo.tagline}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  tagline: e.target.value,
                },
              }))
            }
            placeholder="e.g., Senior Software Engineer with 5+ years of experience"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={resumeData.personalInfo.city}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    city: e.target.value,
                  },
                }))
              }
              placeholder="City"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              value={resumeData.personalInfo.county}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    county: e.target.value,
                  },
                }))
              }
              placeholder="County"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            value={resumeData.personalInfo.postcode}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  postcode: e.target.value,
                },
              }))
            }
            placeholder="Postcode"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={resumeData.personalInfo.phone}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  phone: e.target.value,
                },
              }))
            }
            placeholder="Phone"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  email: e.target.value,
                },
              }))
            }
            placeholder="Email"
          />
        </div>
      </div>
    )
  }

  // Render work experience form
  const renderWorkExperienceForm = () => {
    return (
      <div className="space-y-3">
        <Tabs defaultValue={resumeData.workExperiences[0]?.id}>
          <TabsList className="mb-2">
            {resumeData.workExperiences.map((exp, index) => (
              <TabsTrigger key={exp.id} value={exp.id}>
                Job {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {resumeData.workExperiences.map((exp, index) => (
            <TabsContent key={exp.id} value={exp.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Position {index + 1}</h3>
                {resumeData.workExperiences.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeWorkExperience(exp.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`jobTitle-${exp.id}`}>Job Title *</Label>
                <Input
                  id={`jobTitle-${exp.id}`}
                  value={exp.jobTitle}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.map((item) =>
                        item.id === exp.id ? { ...item, jobTitle: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`employer-${exp.id}`}>Employer *</Label>
                <Input
                  id={`employer-${exp.id}`}
                  value={exp.employer}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.map((item) =>
                        item.id === exp.id ? { ...item, employer: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`location-${exp.id}`}>Location *</Label>
                <Input
                  id={`location-${exp.id}`}
                  value={exp.location}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.map((item) =>
                        item.id === exp.id ? { ...item, location: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., London, UK"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`startDate-${exp.id}`}>Start Date *</Label>
                  <Input
                    id={`startDate-${exp.id}`}
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        workExperiences: prev.workExperiences.map((item) =>
                          item.id === exp.id ? { ...item, startDate: e.target.value } : item,
                        ),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${exp.id}`}
                    type="month"
                    value={exp.endDate}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,\
                        workExperiences: prev.work  => ({
                        ...prev,
                        workExperiences: prev.workExperiences.map((item) =>
                          item.id === exp.id ? { ...item, endDate: e.target.value } : item,
                        ),
                      }))
                    }
                    disabled={exp.currentlyWorkHere}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`currentlyWorkHere-${exp.id}`}
                  checked={exp.currentlyWorkHere}
                  onCheckedChange={(checked) =>
                    setResumeData((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.map((item) =>
                        item.id === exp.id ? { ...item, currentlyWorkHere: !!checked } : item,
                      ),
                    }))
                  }
                />
                <Label htmlFor={`currentlyWorkHere-${exp.id}`} className="text-sm">
                  I currently work here
                </Label>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`description-${exp.id}`}>Job Description</Label>
                <Textarea
                  id={`description-${exp.id}`}
                  value={exp.description}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.map((item) =>
                        item.id === exp.id ? { ...item, description: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Describe your responsibilities and achievements"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Key Responsibilities & Achievements</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateResponsibilitySuggestions()}
                    disabled={isGeneratingSuggestions || !exp.description}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                </div>

                {exp.responsibilities.length > 0 ? (
                  <ul className="space-y-1 list-disc pl-5 text-sm">
                    {exp.responsibilities.map((responsibility, i) => (
                      <li key={i} className="flex justify-between items-center group">
                        <span>{responsibility}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkResponsibility(exp.id, responsibility)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No responsibilities or achievements added yet</p>
                )}

                {responsibilitySuggestions.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium mb-1">Suggestions</h4>
                    {responsibilitySuggestions.map((suggestion, i) => (
                      <SuggestionCard
                        key={i}
                        suggestion={suggestion}
                        onAdd={() => {
                          addWorkResponsibility(exp.id, suggestion)
                          setResponsibilitySuggestions((prev) => prev.filter((s) => s !== suggestion))
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center mt-1">
                  <Input
                    placeholder="Add a new responsibility or achievement"
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addWorkResponsibility(exp.id, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input.value) {
                        addWorkResponsibility(exp.id, input.value)
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={addWorkExperience} variant="outline" size="sm" className="w-full">
          <Plus className="h-3 w-3 mr-1" />
          Add Another Position
        </Button>
      </div>
    )
  }

  // Render education form
  const renderEducationForm = () => {
    return (
      <div className="space-y-3">
        <Tabs defaultValue={resumeData.educations[0]?.id}>
          <TabsList className="mb-2">
            {resumeData.educations.map((edu, index) => (
              <TabsTrigger key={edu.id} value={edu.id}>
                Education {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {resumeData.educations.map((edu, index) => (
            <TabsContent key={edu.id} value={edu.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Education {index + 1}</h3>
                {resumeData.educations.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`institution-${edu.id}`}>Institution *</Label>
                <Input
                  id={`institution-${edu.id}`}
                  value={edu.institution}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, institution: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., University of London"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`location-${edu.id}`}>Institution Location *</Label>
                <Input
                  id={`location-${edu.id}`}
                  value={edu.location}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, location: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., London, UK"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`degree-${edu.id}`}>Degree/Award/Certification *</Label>
                <Input
                  id={`degree-${edu.id}`}
                  value={edu.degree}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, degree: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., Bachelor of Science"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study *</Label>
                <Input
                  id={`fieldOfStudy-${edu.id}`}
                  value={edu.fieldOfStudy}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`graduationDate-${edu.id}`}>Graduation Date (or expected) *</Label>
                <Input
                  id={`graduationDate-${edu.id}`}
                  type="month"
                  value={edu.graduationDate}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, graduationDate: e.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`description-${edu.id}`}>Description</Label>
                <Textarea
                  id={`description-${edu.id}`}
                  value={edu.description}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      educations: prev.educations.map((item) =>
                        item.id === edu.id ? { ...item, description: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Additional details about your education"
                  className="min-h-[60px]"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={addEducation} variant="outline" size="sm" className="w-full">
          <Plus className="h-3 w-3 mr-1" />
          Add Another Education
        </Button>
      </div>
    )
  }

  // Render skills form
  const renderSkillsForm = () => {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Skills</Label>
            <Button variant="ghost" size="sm" onClick={generateSkillSuggestions} disabled={isGeneratingSuggestions}>
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>

          {resumeData.skills.length > 0 ? (
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {resumeData.skills.map((skill, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <span>{skill}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(skill)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No skills added yet</p>
          )}

          {skillSuggestions.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium mb-1">Suggestions</h4>
              {skillSuggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={suggestion}
                  onAdd={() => {
                    addSkill(suggestion)
                    setSkillSuggestions((prev) => prev.filter((s) => s !== suggestion))
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center mt-1">
            <Input
              placeholder="Add a new skill"
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  addSkill(e.currentTarget.value)
                  e.currentTarget.value = ""
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                if (input.value) {
                  addSkill(input.value)
                  input.value = ""
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render professional summary form
  const renderSummaryForm = () => {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="summary" className="text-sm">
              Professional Summary
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateProfessionalSummary}
              disabled={isGeneratingSuggestions || resumeData.workExperiences[0]?.description === ""}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>

          <Textarea
            id="summary"
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                summary: e.target.value,
              }))
            }
            placeholder="Write a professional summary or generate one with AI"
            className="min-h-[120px]"
          />
        </div>
      </div>
    )
  }

  // Render references form
  const renderReferencesForm = () => {
    return (
      <div className="space-y-3">
        <Tabs defaultValue={resumeData.references[0]?.id}>
          <TabsList className="mb-2">
            {resumeData.references.map((ref, index) => (
              <TabsTrigger key={ref.id} value={ref.id}>
                Reference {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {resumeData.references.map((ref, index) => (
            <TabsContent key={ref.id} value={ref.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Reference {index + 1}</h3>
                {resumeData.references.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeReference(ref.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor={`name-${ref.id}`}>Name *</Label>
                <Input
                  id={`name-${ref.id}`}
                  value={ref.name}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      references: prev.references.map((item) =>
                        item.id === ref.id ? { ...item, name: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`position-${ref.id}`}>Job Position *</Label>
                <Input
                  id={`position-${ref.id}`}
                  value={ref.position}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      references: prev.references.map((item) =>
                        item.id === ref.id ? { ...item, position: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="e.g., Manager"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`company-${ref.id}`}>Company *</Label>
                <Input
                  id={`company-${ref.id}`}
                  value={ref.company}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      references: prev.references.map((item) =>
                        item.id === ref.id ? { ...item, company: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`phone-${ref.id}`}>Phone *</Label>
                <Input
                  id={`phone-${ref.id}`}
                  value={ref.phone}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      references: prev.references.map((item) =>
                        item.id === ref.id ? { ...item, phone: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Phone Number"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`email-${ref.id}`}>Email *</Label>
                <Input
                  id={`email-${ref.id}`}
                  type="email"
                  value={ref.email}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      references: prev.references.map((item) =>
                        item.id === ref.id ? { ...item, email: e.target.value } : item,
                      ),
                    }))
                  }
                  placeholder="Email Address"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={addReference} variant="outline" size="sm" className="w-full">
          <Plus className="h-3 w-3 mr-1" />
          Add Another Reference
        </Button>
      </div>
    )
  }

  // Render extra sections form
  const renderExtraSectionsForm = () => {
    const extraSectionTypes = [
      { type: "websites", title: "Websites, Portfolios, Profiles" },
      { type: "certifications", title: "Certifications" },
      { type: "languages", title: "Languages" },
      { type: "software", title: "Software" },
      { type: "accomplishments", title: "Accomplishments" },
      { type: "additionalInfo", title: "Additional Information" },
      { type: "affiliations", title: "Affiliations" },
      { type: "interests", title: "Interests" },
    ] as const

    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-sm">Add a new section</Label>
          <Select
            onValueChange={(value) => {
              const sectionType = extraSectionTypes.find((t) => t.type === value)
              if (sectionType) {
                addExtraSection(sectionType.type as any, sectionType.title)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a section to add" />
            </SelectTrigger>
            <SelectContent>
              {extraSectionTypes.map((section) => (
                <SelectItem
                  key={section.type}
                  value={section.type}
                  disabled={resumeData.extraSections.some((s) => s.type === section.type)}
                >
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {resumeData.extraSections.length > 0 ? (
          <Tabs defaultValue={resumeData.extraSections[0]?.id}>
            <TabsList className="mb-2">
              {resumeData.extraSections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {resumeData.extraSections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => removeExtraSection(section.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {section.items.length > 0 ? (
                  <ul className="space-y-1 list-disc pl-5 text-sm">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-center group">
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtraSectionItem(section.id, item)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No items added yet</p>
                )}

                <div className="flex items-center mt-1">
                  <Input
                    placeholder={`Add a new ${section.title.toLowerCase()} item`}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        addExtraSectionItem(section.id, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input.value) {
                        addExtraSectionItem(section.id, input.value)
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-xs text-muted-foreground">No extra sections added yet</p>
        )}
      </div>
    )
  }

  // Render current section form
  const renderCurrentSectionForm = () => {
    switch (currentSection) {
      case "personal":
        return renderPersonalInfoForm()
      case "work":
        return renderWorkExperienceForm()
      case "education":
        return renderEducationForm()
      case "skills":
        return renderSkillsForm()
      case "summary":
        return renderSummaryForm()
      case "references":
        return renderReferencesForm()
      case "extra":
        return renderExtraSectionsForm()
      default:
        return renderPersonalInfoForm()
    }
  }

  // Optimized layout with collapsible sidebar and fullscreen preview options
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 px-1 h-8">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {isComplete && (
            <Button variant="ghost" size="sm" className="h-7" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}

          {isComplete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPdf} disabled={!hasPaid}>
                  {!hasPaid && <Lock className="h-4 w-4 mr-2 text-muted-foreground" />}
                  {hasPaid ? (
                    <FileIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <span className="text-muted-foreground">Premium Feature</span>
                  )}
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord} disabled={!hasPaid}>
                  {!hasPaid && <Lock className="h-4 w-4 mr-2 text-muted-foreground" />}
                  {hasPaid ? (
                    <FileIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <span className="text-muted-foreground">Premium Feature</span>
                  )}
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFullscreenPreview(!fullscreenPreview)}
          >
            {fullscreenPreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Tabs for section navigation - only show if sidebar is not collapsed */}
        {!sidebarCollapsed && !fullscreenPreview && (
          <div className="border-b">
            <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full">
              <TabsList className="w-full h-8">
                <TabsTrigger value="personal" className="text-xs py-1 px-2">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="work" className="text-xs py-1 px-2">
                  Work
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs py-1 px-2">
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs py-1 px-2">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs py-1 px-2">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="references" className="text-xs py-1 px-2">
                  References
                </TabsTrigger>
                <TabsTrigger value="extra" className="text-xs py-1 px-2">
                  Extra
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex">
          {/* Form section - only show if not in fullscreen preview mode */}
          {!fullscreenPreview && !sidebarCollapsed && (
            <div className="w-1/3 p-1 overflow-y-auto border-r">
              <ScrollArea className="h-full pr-1">
                {renderCurrentSectionForm()}

                <div className="flex justify-between mt-2 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={prevSection}
                    disabled={currentSection === "personal"}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={nextSection}
                    disabled={currentSection === "extra"}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Preview section - wider when sidebar is collapsed or in fullscreen mode */}
          <div
            className={`${fullscreenPreview || sidebarCollapsed ? "w-full" : "w-2/3"} bg-gray-50 p-1 overflow-y-auto`}
          >
            <div className="flex justify-end mb-1 gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.1))}
              >
                -
              </Button>
              <span className="px-2 py-0.5 bg-white border rounded text-xs">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.1))}
              >
                +
              </Button>
            </div>
            <div
              className="bg-white shadow-sm p-4 min-h-full transition-all duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                height: `${100 / zoomLevel}%`,
                width: `${100 / zoomLevel}%`,
                maxWidth: `${100 / zoomLevel}%`,
              }}
            >
              <div className="resume-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderResumeBuilder
