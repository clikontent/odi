"use client"

import { useState, useEffect } from "react"

interface ResumeTemplateProps {
  template: string
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    summary: string
  }
  education: Array<{
    id: number
    school: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
    description: string
  }>
  experience: Array<{
    id: number
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    description: string
  }>
  skills: Array<{
    id: number
    name: string
  }>
}

export function ResumeTemplate({ template, personalInfo, education, experience, skills }: ResumeTemplateProps) {
  const [templateClass, setTemplateClass] = useState("")

  useEffect(() => {
    switch (template) {
      case "modern":
        setTemplateClass("bg-white")
        break
      case "professional":
        setTemplateClass("bg-white border-t-4 border-primary")
        break
      case "creative":
        setTemplateClass("bg-white rounded-lg shadow-lg")
        break
      case "minimal":
        setTemplateClass("bg-white border")
        break
      default:
        setTemplateClass("bg-white")
    }
  }, [template])

  return (
    <div className={`p-8 h-full ${templateClass}`}>
      <div className={template === "professional" ? "mb-6" : "mb-4"}>
        <h2 className={`${template === "creative" ? "text-3xl text-primary" : "text-2xl"} font-bold`}>
          {personalInfo.fullName || "Your Name"}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && (
            <>
              <div>•</div>
              <div>{personalInfo.phone}</div>
            </>
          )}
          {personalInfo.address && (
            <>
              <div>•</div>
              <div>{personalInfo.address}</div>
            </>
          )}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mt-6">
          <h3 className={`${template === "creative" ? "text-primary" : ""} text-lg font-semibold border-b pb-1 mb-2`}>
            Professional Summary
          </h3>
          <p className="text-sm">{personalInfo.summary}</p>
        </div>
      )}

      {experience.some((exp) => exp.company || exp.position) && (
        <div className="mt-6">
          <h3 className={`${template === "creative" ? "text-primary" : ""} text-lg font-semibold border-b pb-1 mb-2`}>
            Work Experience
          </h3>
          {experience.map((exp) =>
            exp.company || exp.position ? (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                      {exp.location ? `, ${exp.location}` : ""}
                    </p>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                  )}
                </div>
                {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
              </div>
            ) : null,
          )}
        </div>
      )}

      {education.some((edu) => edu.school || edu.degree) && (
        <div className="mt-6">
          <h3 className={`${template === "creative" ? "text-primary" : ""} text-lg font-semibold border-b pb-1 mb-2`}>
            Education
          </h3>
          {education.map((edu) =>
            edu.school || edu.degree ? (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">
                      {edu.degree}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    </h4>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                  </div>
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate || "Present"}
                    </p>
                  )}
                </div>
                {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
              </div>
            ) : null,
          )}
        </div>
      )}

      {skills.some((skill) => skill.name) && (
        <div className="mt-6">
          <h3 className={`${template === "creative" ? "text-primary" : ""} text-lg font-semibold border-b pb-1 mb-2`}>
            Skills
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) =>
              skill.name ? (
                <div
                  key={skill.id}
                  className={`${
                    template === "creative" ? "bg-primary/10 text-primary" : "bg-muted"
                  } px-3 py-1 rounded-full text-sm`}
                >
                  {skill.name}
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  )
}
