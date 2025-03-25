"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash } from "lucide-react"

export function ResumeEditor() {
  const [experiences, setExperiences] = useState([
    { id: 1, company: "", position: "", startDate: "", endDate: "", description: "" },
  ])

  const [education, setEducation] = useState([{ id: 1, school: "", degree: "", field: "", startDate: "", endDate: "" }])

  const addExperience = () => {
    const newId = experiences.length ? Math.max(...experiences.map((e) => e.id)) + 1 : 1
    setExperiences([
      ...experiences,
      {
        id: newId,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const addEducation = () => {
    const newId = education.length ? Math.max(...education.map((e) => e.id)) + 1 : 1
    setEducation([
      ...education,
      {
        id: newId,
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
      },
    ])
  }

  const removeEducation = (id: number) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="personal">
        <AccordionItem value="personal">
          <AccordionTrigger>Personal Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" placeholder="Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+254 712 345 678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Nairobi, Kenya" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Experienced software engineer with a passion for developing innovative solutions..."
                  rows={4}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger>Work Experience</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={exp.id} className="space-y-4 rounded-lg border p-4 relative">
                  {experiences.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove experience</span>
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`company-${exp.id}`}>Company</Label>
                    <Input id={`company-${exp.id}`} placeholder="Acme Inc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`position-${exp.id}`}>Position</Label>
                    <Input id={`position-${exp.id}`} placeholder="Senior Developer" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                      <Input id={`startDate-${exp.id}`} placeholder="Jan 2020" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                      <Input id={`endDate-${exp.id}`} placeholder="Present" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${exp.id}`}>Description</Label>
                    <Textarea
                      id={`description-${exp.id}`}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={4}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addExperience}>
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education">
          <AccordionTrigger>Education</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-4 rounded-lg border p-4 relative">
                  {education.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove education</span>
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`school-${edu.id}`}>School/University</Label>
                    <Input id={`school-${edu.id}`} placeholder="University of Nairobi" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                    <Input id={`degree-${edu.id}`} placeholder="Bachelor's" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                    <Input id={`field-${edu.id}`} placeholder="Computer Science" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`eduStartDate-${edu.id}`}>Start Date</Label>
                      <Input id={`eduStartDate-${edu.id}`} placeholder="Sep 2016" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`eduEndDate-${edu.id}`}>End Date</Label>
                      <Input id={`eduEndDate-${edu.id}`} placeholder="Jun 2020" />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addEducation}>
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills">
          <AccordionTrigger>Skills</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Textarea
                  id="skills"
                  placeholder="JavaScript, React, Node.js, Project Management, Team Leadership"
                  rows={4}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Pro tip: Include skills mentioned in the job description to improve ATS matching.
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

