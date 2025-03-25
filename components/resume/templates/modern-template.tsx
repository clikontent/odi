interface ResumeData {
  personal: {
    firstName: string
    lastName: string
    jobTitle: string
    email: string
    phone: string
    location: string
    summary: string
  }
  experience: Array<{
    id: number
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    id: number
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
  }>
  skills: string[]
}

interface ModernTemplateProps {
  data: ResumeData
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  return (
    <div className="bg-white text-black min-h-[1000px] shadow-sm border">
      {/* Header with accent color */}
      <header className="bg-primary text-white p-8">
        <h1 className="text-3xl font-bold mb-1">
          {data.personal.firstName} {data.personal.lastName}
        </h1>
        <p className="text-xl opacity-90 mb-4">{data.personal.jobTitle}</p>
        <div className="flex flex-wrap gap-4 text-sm opacity-90">
          <span>{data.personal.email}</span>
          <span>{data.personal.phone}</span>
          <span>{data.personal.location}</span>
        </div>
      </header>

      <div className="p-8">
        {/* Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-primary border-b border-primary pb-1">Professional Summary</h2>
          <p className="text-gray-700">{data.personal.summary}</p>
        </section>

        {/* Two column layout for the rest */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left column */}
          <div className="col-span-2">
            {/* Experience */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-primary border-b border-primary pb-1">Work Experience</h2>
              {data.experience.map((exp) => (
                <div key={exp.id} className="mb-6">
                  <div className="flex flex-col mb-1">
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-primary font-medium">{exp.company}</p>
                      <span className="text-sm text-gray-600">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Right column */}
          <div>
            {/* Education */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-primary border-b border-primary pb-1">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-bold">{edu.school}</h3>
                  <p className="text-gray-700">
                    {edu.degree} in {edu.field}
                  </p>
                  <p className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              ))}
            </section>

            {/* Skills */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-primary border-b border-primary pb-1">Skills</h2>
              <div className="flex flex-col gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="text-gray-700">
                    • {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

