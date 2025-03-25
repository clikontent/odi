"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, Sparkles } from "lucide-react"

interface CoverLetterGeneratorProps {
  onGenerate?: (content: string) => void
}

export function CoverLetterGenerator({ onGenerate }: CoverLetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    hiringManager: "",
    jobDescription: "",
    keyExperience: "",
    tone: "professional",
  })
  const [coverLetter, setCoverLetter] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tone: value }))
  }

  const generateCoverLetter = async () => {
    setIsGenerating(true)

    try {
      // In a real implementation, this would call an AI service using the Gemini API
      // const response = await fetch('/api/generate-cover-letter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      // const data = await response.json()

      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate different cover letters based on tone
      let generatedLetter = ""

      if (formData.tone === "professional") {
        generatedLetter = `Dear ${formData.hiringManager || "Hiring Manager"},

I am writing to express my interest in the ${formData.jobTitle} position at ${formData.company}. With over 8 years of experience in developing scalable web applications using JavaScript, TypeScript, React, and Node.js, I am confident in my ability to contribute to your team's success.

In my current role as a Senior Software Engineer at Digital Solutions Inc, I have led a team of 5 developers in building a financial management platform. I implemented CI/CD pipelines that reduced deployment time by 40% and optimized database queries resulting in 30% faster load times. I believe these achievements align well with your company's focus on creating efficient and user-friendly software solutions.

I am particularly drawn to ${formData.company} because of your commitment to innovation and your impact in the Kenyan tech ecosystem. Your recent project on developing digital solutions for small businesses resonates with my passion for creating technology that makes a real difference.

I am excited about the possibility of bringing my technical expertise and leadership skills to your team. I would welcome the opportunity to discuss how my background and skills would be a good fit for this position.

Thank you for considering my application.

Sincerely,
John Doe`
      } else if (formData.tone === "enthusiastic") {
        generatedLetter = `Dear ${formData.hiringManager || "Hiring Manager"},

I'm thrilled to apply for the ${formData.jobTitle} position at ${formData.company}! As soon as I saw this opportunity, I knew it was the perfect match for my skills and passion for technology.

Throughout my career as a software engineer, I've consistently delivered results that exceed expectations. At Digital Solutions Inc, I led an amazing team that built a game-changing financial platform, cutting deployment time by 40% and making our application lightning-fast for users. These achievements reflect my commitment to excellence and innovation – values that I know ${formData.company} champions.

What excites me most about ${formData.company} is your groundbreaking work in the Kenyan tech space. Your mission to empower small businesses through technology aligns perfectly with my personal goal of creating solutions that make a meaningful impact. I'm particularly impressed by your recent initiatives and can't wait to contribute my expertise to your future projects!

I would love the opportunity to discuss how my enthusiasm, technical skills, and leadership experience could benefit your team. I'm confident that together, we could create something truly exceptional.

Thank you for considering my application – I'm looking forward to the possibility of working with your incredible team!

With excitement,
John Doe`
      } else {
        generatedLetter = `Dear ${formData.hiringManager || "Hiring Manager"},

I am writing regarding the ${formData.jobTitle} position at ${formData.company}. Based on my review of the job requirements, I believe my experience and skills make me a suitable candidate for this role.

My professional background includes eight years of software development experience with a focus on web applications. At Digital Solutions Inc, I managed a development team that created a financial management platform, improving deployment efficiency by 40% and application performance by 30%.

The position at ${formData.company} interests me due to your company's reputation for innovation in the Kenyan technology sector. Your work developing solutions for small businesses appears to be both practical and impactful.

I am available to discuss my qualifications further and how they might benefit your organization. Thank you for your consideration.

Regards,
John Doe`
      }

      setCoverLetter(generatedLetter)

      if (onGenerate) {
        onGenerate(generatedLetter)
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter)
  }

  const downloadCoverLetter = () => {
    const element = document.createElement("a")
    const file = new Blob([coverLetter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "Cover_Letter.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Cover Letter Generator</CardTitle>
        <CardDescription>Create a tailored cover letter in seconds</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="preview" disabled={!coverLetter}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Software Engineer"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="e.g., Tech Innovations Ltd"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hiringManager">Hiring Manager (Optional)</Label>
              <Input
                id="hiringManager"
                placeholder="e.g., Jane Smith"
                value={formData.hiringManager}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                rows={4}
                value={formData.jobDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyExperience">Key Experience to Highlight</Label>
              <Textarea
                id="keyExperience"
                placeholder="List your relevant experience for this role..."
                rows={3}
                value={formData.keyExperience}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={handleSelectChange}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose the tone that best fits the company culture</p>
            </div>

            <Button
              onClick={generateCoverLetter}
              disabled={isGenerating || !formData.jobTitle || !formData.company}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="pt-4">
            {coverLetter && (
              <div className="space-y-4">
                <div className="relative rounded-md border p-6 bg-white text-black">
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={downloadCoverLetter}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                  <div className="whitespace-pre-line pr-16">{coverLetter}</div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCoverLetter("")}>
                    Regenerate
                  </Button>
                  <Button onClick={downloadCoverLetter}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

