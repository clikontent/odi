"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Save } from "lucide-react"
import { CoverLetterGenerator } from "@/components/ai/cover-letter-generator"

export default function CoverLetterPage() {
  const [coverLetter, setCoverLetter] = useState("")

  const handleGenerateCoverLetter = (content: string) => {
    setCoverLetter(content)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h2>
          <p className="text-muted-foreground">Create tailored cover letters for job applications</p>
        </div>
        {coverLetter && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <CoverLetterGenerator onGenerate={handleGenerateCoverLetter} />
            </div>

            <div>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium">Preview</h3>
                  </div>

                  {coverLetter ? (
                    <div className="whitespace-pre-line bg-white p-6 border rounded-md min-h-[500px] text-black overflow-auto max-h-[600px]">
                      {coverLetter}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[500px] border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">Your cover letter will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CoverLetterTemplateCard
              title="Professional"
              description="A formal template suitable for corporate positions"
            />
            <CoverLetterTemplateCard title="Modern" description="A contemporary design with a clean layout" />
            <CoverLetterTemplateCard title="Creative" description="A bold design for creative industry positions" />
            <CoverLetterTemplateCard title="Simple" description="A minimalist design focusing on content" isPremium />
            <CoverLetterTemplateCard
              title="Executive"
              description="An elegant template for senior positions"
              isPremium
            />
            <CoverLetterTemplateCard
              title="Technical"
              description="Optimized for technical and engineering roles"
              isPremium
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CoverLetterTemplateCardProps {
  title: string
  description: string
  isPremium?: boolean
}

function CoverLetterTemplateCard({ title, description, isPremium }: CoverLetterTemplateCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-background/80 rounded-md flex flex-col items-center justify-center p-4">
            <div className="w-full space-y-2">
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        {isPremium && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            Premium
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <Button className="w-full mt-3" variant={isPremium ? "outline" : "default"} disabled={isPremium}>
          {isPremium ? "Upgrade to Access" : "Use Template"}
        </Button>
      </CardContent>
    </Card>
  )
}

