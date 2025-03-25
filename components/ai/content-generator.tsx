"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Sparkles } from "lucide-react"

type ContentType = "summary" | "experience" | "skills" | "education"

interface ContentGeneratorProps {
  type: ContentType
  onGenerate?: (content: string) => void
}

export function ContentGenerator({ type, onGenerate }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [variations, setVariations] = useState<string[]>([])
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | null>(null)

  const generateContent = async () => {
    if (!prompt) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would call an AI service using the Gemini API
      // const response = await fetch('/api/generate-content', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, type })
      // })
      // const data = await response.json()

      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response data based on content type
      let content = ""
      let contentVariations: string[] = []

      switch (type) {
        case "summary":
          content =
            "Experienced software engineer with over 8 years of expertise in developing scalable web applications. Proficient in JavaScript, TypeScript, React, and Node.js with a strong focus on creating intuitive user experiences and optimizing application performance. Demonstrated success in leading development teams and implementing CI/CD pipelines that improved deployment efficiency by 40%."
          contentVariations = [
            "Innovative software engineer with 8+ years of experience building high-performance web applications using JavaScript, TypeScript, React, and Node.js. Passionate about creating exceptional user experiences and optimizing code for maximum efficiency. Proven track record of leading development teams and implementing automated workflows that significantly reduce deployment time.",
            "Results-driven software engineer with extensive experience in full-stack web development. Specialized in JavaScript, TypeScript, React, and Node.js with a keen eye for user experience and performance optimization. Successfully led multiple development teams and implemented modern CI/CD practices that enhanced overall productivity.",
          ]
          break

        case "experience":
          content =
            "Led a team of 5 developers in building a financial management platform that processed over $10M in transactions monthly. Implemented CI/CD pipelines that reduced deployment time by 40%. Optimized database queries resulting in 30% faster load times and improved user satisfaction scores by 25%."
          contentVariations = [
            "Spearheaded the development of a high-volume financial platform handling $10M+ monthly transactions. Managed a team of 5 developers to deliver features on time and within budget. Implemented automated deployment pipelines that cut release times by 40% and optimized database performance, resulting in 30% faster application response times.",
            "Directed a cross-functional team in developing an enterprise-grade financial management system. Oversaw all aspects of the development lifecycle while mentoring junior developers. Engineered efficient CI/CD workflows that accelerated deployment by 40% and implemented database optimizations that improved system performance by 30%.",
          ]
          break

        case "skills":
          content =
            "JavaScript, TypeScript, React, Node.js, Express, MongoDB, SQL, RESTful APIs, GraphQL, AWS, Docker, Kubernetes, CI/CD, Git, Agile Methodologies, Team Leadership"
          contentVariations = [
            "Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Redux\nBackend: Node.js, Express, MongoDB, PostgreSQL, RESTful APIs\nDevOps: AWS, Docker, Kubernetes, CI/CD pipelines\nMethodologies: Agile, Scrum, Test-Driven Development",
            "Programming Languages: JavaScript, TypeScript, Python\nWeb Technologies: React, Redux, Node.js, Express\nDatabases: MongoDB, MySQL, PostgreSQL\nCloud Services: AWS (EC2, S3, Lambda)\nTools: Git, Docker, Jenkins, Jira",
          ]
          break

        case "education":
          content =
            "Bachelor of Science in Computer Science\nUniversity of Nairobi\nGraduation: June 2017\nRelevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Web Development"
          contentVariations = [
            "B.Sc. Computer Science, University of Nairobi (2013-2017)\nGPA: 3.8/4.0\nHonors: Dean's List (2015-2017)\nRelevant Coursework: Advanced Algorithms, Machine Learning, Software Architecture",
            "Bachelor of Science in Computer Science\nUniversity of Nairobi, 2017\nAcademic Projects: Developed a real-time chat application using WebSockets, Created a machine learning model for predictive analytics",
          ]
          break
      }

      setGeneratedContent(content)
      setVariations(contentVariations)

      if (onGenerate) {
        onGenerate(content)
      }
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleUseVariation = (index: number) => {
    setSelectedVariationIndex(index)
    const selectedVariation = variations[index]
    setGeneratedContent(selectedVariation)

    if (onGenerate) {
      onGenerate(selectedVariation)
    }
  }

  const getPromptPlaceholder = () => {
    switch (type) {
      case "summary":
        return "e.g., Senior Software Engineer with experience in React and Node.js..."
      case "experience":
        return "e.g., Led a team of developers at a fintech company..."
      case "skills":
        return "e.g., JavaScript developer with React, Node.js experience..."
      case "education":
        return "e.g., Computer Science degree from University of Nairobi..."
    }
  }

  const getTitle = () => {
    switch (type) {
      case "summary":
        return "Professional Summary Generator"
      case "experience":
        return "Work Experience Generator"
      case "skills":
        return "Skills Generator"
      case "education":
        return "Education Generator"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>Generate professional content for your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Describe your {type}</Label>
          <Textarea
            placeholder={getPromptPlaceholder()}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Provide details about your {type} for better results</p>
        </div>

        <Button onClick={generateContent} disabled={isGenerating || !prompt} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : `Generate ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>

        {generatedContent && (
          <div className="space-y-4 mt-6">
            <Tabs defaultValue="generated">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generated">Generated Content</TabsTrigger>
                <TabsTrigger value="variations">Variations</TabsTrigger>
              </TabsList>

              <TabsContent value="generated" className="space-y-4 pt-4">
                <div className="relative rounded-md border p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => copyToClipboard(generatedContent)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy to clipboard</span>
                  </Button>
                  <p className="pr-8 whitespace-pre-line">{generatedContent}</p>
                </div>
              </TabsContent>

              <TabsContent value="variations" className="space-y-4 pt-4">
                {variations.map((variation, index) => (
                  <div key={index} className="relative rounded-md border p-4">
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(variation)}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy to clipboard</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUseVariation(index)}>
                        Use
                      </Button>
                    </div>
                    <p className="pr-16 whitespace-pre-line">{variation}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

