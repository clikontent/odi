import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

interface CoverLetter {
  id: string
  title: string
  created_at: string
  updated_at: string
  job_title?: string
  company_name?: string
}

interface CoverLetterStatsProps {
  coverLetters: CoverLetter[]
}

export function CoverLetterStats({ coverLetters }: CoverLetterStatsProps) {
  // Count cover letters by company (or use random data if not available)
  const companyData = coverLetters.reduce(
    (acc, letter) => {
      const company = letter.company_name || "Unknown"
      acc[company] = (acc[company] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data format
  const chartData = Object.entries(companyData).map(([name, value]) => ({
    name,
    value,
  }))

  // If no data, add placeholder
  if (chartData.length === 0) {
    chartData.push({ name: "No Data", value: 1 })
  }

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="h-[200px]">
      {coverLetters.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              label={({ name }) => name}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No cover letter data available</p>
        </div>
      )}
    </div>
  )
}
