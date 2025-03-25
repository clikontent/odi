"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProfessionalTemplate } from "@/components/resume/templates/professional-template"
import { ModernTemplate } from "@/components/resume/templates/modern-template"
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Download, Printer } from "lucide-react"

export default function ResumePreviewPage() {
  const router = useRouter()
  const [template, setTemplate] = useState("professional")

  // Sample data for preview
  const resumeData = {
    personal: {
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Senior Software Engineer",
      email: "john.doe@example.com",
      phone: "+254 712 345 678",
      location: "Nairobi, Kenya",
      summary:
        "Experienced software engineer with over 8 years of experience developing scalable web applications. Proficient in JavaScript, TypeScript, React, and Node.js. Passionate about creating intuitive user experiences and optimizing application performance.",
    },
    experience: [
      {
        id: 1,
        company: "Tech Innovations Ltd",
        position: "Senior Software Engineer",
        startDate: "Jan 2020",
        endDate: "Present",
        description:
          "Led a team of 5 developers in building a financial management platform. Implemented CI/CD pipelines that reduced deployment time by 40%. Optimized database queries resulting in 30% faster load times.",
      },
      {
        id: 2,
        company: "Digital Solutions Inc",
        position: "Software Developer",
        startDate: "Mar 2017",
        endDate: "Dec 2019",
        description:
          "Developed and maintained multiple web applications using React and Node.js. Collaborated with UX designers to implement responsive designs. Participated in code reviews and mentored junior developers.",
      },
    ],
    education: [
      {
        id: 1,
        school: "University of Nairobi",
        degree: "Bachelor's",
        field: "Computer Science",
        startDate: "Sep 2013",
        endDate: "Jun 2017",
      },
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "Git",
      "CI/CD",
      "Agile Methodologies",
      "Team Leadership",
    ],
  }

  const handleBack = () => {
    router.back()
  }

  const handleCheckout = () => {
    router.push("/dashboard/resume-builder/checkout")
  }

  // Render the selected template
  const renderTemplate = () => {
    switch (template) {
      case "professional":
        return <ProfessionalTemplate data={resumeData} />
      case "modern":
        return <ModernTemplate data={resumeData} />
      case "minimalist":
        return <MinimalistTemplate data={resumeData} />
      default:
        return <ProfessionalTemplate data={resumeData} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" onClick={handleCheckout}>
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-muted p-8 flex justify-center overflow-auto">
        <div className="w-[210mm] bg-white shadow-lg">{renderTemplate()}</div>
      </div>
    </div>
  )
}

