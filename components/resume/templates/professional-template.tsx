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

interface ProfessionalTemplateProps {
  data: ResumeData
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[1000px] shadow-sm border">
      {/* Header */}
      <header className="text-center mb-6 pb-6 border-b border-gray-300">
        <h1 className="text-3xl font-bold mb-1">
          {data.personal.firstName} {data.personal.lastName}
        </h1>
        <p className="text-xl text-gray-600 mb-3">{data.personal.jobTitle}</p>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <span>{data.personal.email}</span>
          <span>•</span>
          <span>{data.personal.phone}</span>
          <span>•</span>
          <span>{data.personal.location}</span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2 text-gray-800 uppercase">Professional Summary</h2>
        <p className="text-gray-700">{data.personal.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3 text-gray-800 uppercase">Work Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold">{exp.position}</h3>
              <span className="text-sm text-gray-600">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{exp.company}</p>
            <p className="text-sm text-gray-700">{exp.description}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3 text-gray-800 uppercase">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold">{edu.school}</h3>
              <span className="text-sm text-gray-600">
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
        <h2 className="text-lg font-bold mb-3 text-gray-800 uppercase">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

