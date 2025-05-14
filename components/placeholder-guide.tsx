"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function PlaceholderGuide() {
  const [activeTab, setActiveTab] = useState("personal")
  const [open, setOpen] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Placeholder has been copied to clipboard",
    })
  }

  const placeholders = {
    personal: [
      { name: "{NAME}", description: "Your first name" },
      { name: "{SURNAME}", description: "Your last name" },
      { name: "{FULL_NAME}", description: "Your complete name" },
      { name: "{TAGLINE}", description: "Your professional tagline" },
      { name: "{CITY}", description: "City location" },
      { name: "{COUNTY}", description: "County/state location" },
      { name: "{POSTCODE}", description: "Postal/ZIP code" },
      { name: "{PHONE}", description: "Phone number" },
      { name: "{EMAIL}", description: "Email address" },
    ],
    experience: [
      { name: "{WORK_EXPERIENCE}", description: "All work experiences combined" },
      { name: "{WORK_EXPERIENCE_1}", description: "First work experience entry" },
      { name: "{WORK_EXPERIENCE_2}", description: "Second work experience entry" },
      { name: "{JOB_TITLE_1}", description: "Job title for position #1" },
      { name: "{EMPLOYER_1}", description: "Employer name for position #1" },
      { name: "{WORK_LOCATION_1}", description: "Location for position #1" },
      { name: "{WORK_START_DATE_1}", description: "Start date for position #1" },
      { name: "{WORK_END_DATE_1}", description: "End date for position #1" },
      { name: "{WORK_DESCRIPTION_1}", description: "Job description for position #1" },
      { name: "{WORK_ACHIEVEMENTS_1}", description: "Achievements for position #1" },
    ],
    education: [
      { name: "{EDUCATION}", description: "All education entries combined" },
      { name: "{EDUCATION_1}", description: "First education entry" },
      { name: "{EDUCATION_2}", description: "Second education entry" },
      { name: "{INSTITUTION_1}", description: "School/university name for education #1" },
      { name: "{EDUCATION_LOCATION_1}", description: "Location for education #1" },
      { name: "{DEGREE_1}", description: "Degree type for education #1" },
      { name: "{FIELD_OF_STUDY_1}", description: "Major/specialization for education #1" },
      { name: "{GRADUATION_DATE_1}", description: "Graduation date for education #1" },
      { name: "{EDUCATION_DESCRIPTION_1}", description: "Description for education #1" },
    ],
    skills: [
      { name: "{SKILLS}", description: "All skills combined as a list" },
      { name: "{SKILL_1}", description: "First skill" },
      { name: "{SKILL_2}", description: "Second skill" },
      { name: "{SKILL_3}", description: "Third skill" },
      { name: "{ACHIEVEMENTS}", description: "All achievements combined as a list" },
      { name: "{ACHIEVEMENT_1}", description: "First achievement" },
      { name: "{ACHIEVEMENT_2}", description: "Second achievement" },
    ],
    other: [
      { name: "{PROFESSIONAL_SUMMARY}", description: "Your professional summary" },
      { name: "{CERTIFICATIONS}", description: "Certifications section" },
      { name: "{LANGUAGES}", description: "Languages section" },
      { name: "{WEBSITES}", description: "Websites, portfolios, profiles section" },
      { name: "{SOFTWARE}", description: "Software proficiency section" },
      { name: "{ACCOMPLISHMENTS}", description: "Accomplishments section" },
      { name: "{ADDITIONALINFO}", description: "Additional information section" },
      { name: "{AFFILIATIONS}", description: "Affiliations section" },
      { name: "{INTERESTS}", description: "Interests section" },
    ],
    references: [
      { name: "{REFERENCES}", description: "All references combined" },
      { name: "{REFERENCE_1}", description: "First reference entry" },
      { name: "{REFERENCE_2}", description: "Second reference entry" },
      { name: "{REFERENCE_NAME_1}", description: "Name for reference #1" },
      { name: "{REFERENCE_POSITION_1}", description: "Job position for reference #1" },
      { name: "{REFERENCE_COMPANY_1}", description: "Company for reference #1" },
      { name: "{REFERENCE_PHONE_1}", description: "Phone for reference #1" },
      { name: "{REFERENCE_EMAIL_1}", description: "Email for reference #1" },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <InfoIcon className="h-4 w-4 mr-2" />
          Placeholder Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resume Placeholder System Guide</DialogTitle>
          <DialogDescription>
            Use these placeholders in your resume templates. They will be automatically replaced with your content.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          {Object.entries(placeholders).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{key} Information Placeholders</CardTitle>
                  <CardDescription>Click on any placeholder to copy it to your clipboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-2 border rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => copyToClipboard(item.name)}
                      >
                        <div>
                          <p className="font-mono text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Tips for Template Creation</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Use numbered placeholders (e.g., {"{WORK_EXPERIENCE_1}"}) for specific entries</li>
            <li>Use general placeholders (e.g., {"{SKILLS}"}) for combined sections</li>
            <li>All placeholders are automatically replaced with appropriate content</li>
            <li>Unused placeholders are removed from the final document</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
