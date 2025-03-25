"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Building, Clock, MapPin, Search } from "lucide-react"
import { JobApplicationTracker } from "@/components/job/job-application-tracker"

export default function JobBoardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("jobs")

  // Sample job data
  const jobs = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "Tech Innovations Ltd",
      location: "Nairobi, Kenya",
      type: "Full-time",
      salary: "KSh 150,000 - 200,000",
      posted: "2 days ago",
      description:
        "We are looking for a Senior Software Engineer to join our team and help build scalable web applications using modern technologies like React, Node.js, and AWS.",
      tags: ["React", "Node.js", "AWS", "TypeScript"],
    },
    {
      id: "2",
      title: "Product Manager",
      company: "Digital Solutions Inc",
      location: "Remote (Kenya)",
      type: "Full-time",
      salary: "KSh 180,000 - 250,000",
      posted: "1 week ago",
      description:
        "Join our product team to lead the development of innovative digital products. You'll work closely with engineering, design, and business teams to deliver exceptional user experiences.",
      tags: ["Product Management", "Agile", "UX", "Strategy"],
    },
    {
      id: "3",
      title: "UX/UI Designer",
      company: "Creative Studio",
      location: "Mombasa, Kenya",
      type: "Contract",
      salary: "KSh 100,000 - 150,000",
      posted: "3 days ago",
      description:
        "We're seeking a talented UX/UI Designer to create beautiful, intuitive interfaces for our clients. You should have a strong portfolio showcasing your design skills and problem-solving abilities.",
      tags: ["UI Design", "UX Research", "Figma", "Adobe XD"],
    },
    {
      id: "4",
      title: "Data Analyst",
      company: "Analytics Pro",
      location: "Nairobi, Kenya",
      type: "Part-time",
      salary: "KSh 80,000 - 120,000",
      posted: "5 days ago",
      description:
        "Looking for a Data Analyst to help us extract insights from our customer data. You'll create reports, dashboards, and conduct analysis to support business decisions.",
      tags: ["SQL", "Python", "Data Visualization", "Excel"],
    },
    {
      id: "5",
      title: "Marketing Specialist",
      company: "Growth Hackers",
      location: "Remote (Kenya)",
      type: "Full-time",
      salary: "KSh 120,000 - 160,000",
      posted: "1 day ago",
      description:
        "Join our marketing team to develop and execute digital marketing campaigns. You'll work on SEO, content marketing, social media, and email campaigns to drive growth.",
      tags: ["Digital Marketing", "SEO", "Content", "Analytics"],
    },
  ]

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Board</h2>
        <p className="text-muted-foreground">Find and apply for jobs that match your skills and experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Search Jobs</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, company, or keywords..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:w-2/5">
              <div>
                <Label>Location</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="mombasa">Mombasa</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Job Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <JobApplicationTracker />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Recommendations</CardTitle>
              <CardDescription>Jobs recommended based on your profile and resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed p-8 text-center">
                <h3 className="text-lg font-medium">Premium Feature</h3>
                <p className="text-muted-foreground mt-2">
                  Upgrade to premium to get personalized job recommendations based on your skills and experience.
                </p>
                <Button className="mt-4">Upgrade to Premium</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string
    posted: string
    description: string
    tags: string[]
  }
}

function JobCard({ job }: JobCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Building className="mr-1 h-3 w-3" />
              {job.company}
            </CardDescription>
          </div>
          <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{job.description}</p>

        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-1 h-3 w-3" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Briefcase className="mr-1 h-3 w-3" />
            {job.salary}
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {job.posted}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Save</Button>
        <Button asChild>
          <Link href={`/dashboard/job-board/${job.id}`}>Apply Now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  )
}

