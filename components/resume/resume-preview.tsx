import { ProfessionalTemplate } from "@/components/resume/templates/professional-template"
import { ModernTemplate } from "@/components/resume/templates/modern-template"
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template"

interface ResumePreviewProps {
  template: string
}

export function ResumePreview({ template }: ResumePreviewProps) {
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

  // Render the selected template
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

