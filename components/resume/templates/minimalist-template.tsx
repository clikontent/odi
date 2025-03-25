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

interface MinimalistTemplateProps {
  data: ResumeData
}

export function MinimalistTemplate({ data }: MinimalistTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[1000px] shadow-sm border font-light">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-normal tracking-tight mb-1">
          {data.personal.firstName} {data.personal.lastName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{data.personal.jobTitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{data.personal.email}</span>
          <span>{data.personal.phone}</span>
          <span>{data.personal.location}</span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-md uppercase tracking-wider mb-4 text-gray-500">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-medium">{exp.position}</h3>
              <span className="text-sm text-gray-500">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{exp.company}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-md uppercase tracking-wider mb-4 text-gray-500">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium">{edu.school}</h3>
              <span className="text-sm text-gray-500">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
            <p className="text-gray-700">
              {edu.degree} in {edu.field}
            </p>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-md uppercase tracking-wider mb-4 text-gray-500">Skills</h2>
        <p className="text-gray-700">{data.skills.join(" • ")}</p>
      </section>
    </div>
  )
}

