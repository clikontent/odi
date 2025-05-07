import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface Resume {
  id: string
  title: string
  created_at: string
  updated_at: string
  views?: number
  downloads?: number
}

interface ResumeStatsProps {
  resumes: Resume[]
}

export function ResumeStats({ resumes }: ResumeStatsProps) {
  // Generate data for the chart
  const chartData = resumes.map((resume) => ({
    name: resume.title.length > 15 ? resume.title.substring(0, 15) + "..." : resume.title,
    views: resume.views || Math.floor(Math.random() * 10),
    downloads: resume.downloads || Math.floor(Math.random() * 5),
  }))

  return (
    <div className="h-[200px]">
      {resumes.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="views" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="downloads" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No resume data available</p>
        </div>
      )}
    </div>
  )
}
