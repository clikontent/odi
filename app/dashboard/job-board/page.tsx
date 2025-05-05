"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, DollarSign, Clock, Building, ExternalLink, Share2, BookmarkPlus, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock job data
const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Nairobi, Kenya (Remote)",
    salary: "KSh 150,000 - 200,000",
    type: "Full-time",
    posted: "2 days ago",
    logo: "/placeholder.svg?height=60&width=60",
    description:
      "Google is seeking a talented Senior Frontend Developer to join our team. You will be responsible for building user interfaces for our products and services.",
    responsibilities: [
      "Develop new user-facing features using React.js",
      "Build reusable components and libraries for future use",
      "Translate designs and wireframes into high-quality code",
      "Optimize components for maximum performance across devices and browsers",
      "Collaborate with back-end developers and designers",
    ],
    requirements: [
      "5+ years of experience in frontend development",
      "Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model",
      "Thorough understanding of React.js and its core principles",
      "Experience with popular React.js workflows (such as Flux or Redux)",
      "Familiarity with newer specifications of ECMAScript",
      "Experience with data structure libraries (e.g., Immutable.js)",
    ],
    benefits: [
      "Competitive salary and equity",
      "Health, dental, and vision insurance",
      "Unlimited PTO",
      "401(k) with employer match",
      "Gym stipend",
      "Professional development budget",
    ],
    applicationUrl: "https://careers.google.com",
    applyInApp: false,
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Safaricom",
    location: "Nairobi, Kenya",
    salary: "KSh 120,000 - 180,000",
    type: "Full-time",
    posted: "1 week ago",
    logo: "/placeholder.svg?height=60&width=60",
    description:
      "Safaricom is looking for a Backend Engineer to help build and maintain our core services. You will work on high-performance, scalable systems that power our mobile money platform.",
    responsibilities: [
      "Design and implement backend services and APIs",
      "Optimize database queries and improve performance",
      "Implement security and data protection measures",
      "Participate in code reviews and mentor junior developers",
      "Collaborate with frontend developers and product managers",
    ],
    requirements: [
      "4+ years of experience in backend development",
      "Strong knowledge of Java, Python, or Node.js",
      "Experience with database design and optimization",
      "Understanding of RESTful APIs and microservices architecture",
      "Knowledge of cloud services (AWS, GCP, or Azure)",
    ],
    benefits: [
      "Medical and life insurance",
      "Retirement benefits plan",
      "Educational assistance",
      "Flexible working hours",
      "Staff discounts on Safaricom products",
    ],
    applicationUrl: "https://careers.safaricom.co.ke",
    applyInApp: true,
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Microsoft",
    location: "Remote (Kenya)",
    salary: "KSh 130,000 - 170,000",
    type: "Contract",
    posted: "3 days ago",
    logo: "/placeholder.svg?height=60&width=60",
    description:
      "Microsoft is seeking a talented UX/UI Designer to create amazing user experiences. You will work on designing interfaces for our products that are intuitive and visually appealing.",
    responsibilities: [
      "Create user flows, wireframes, and prototypes",
      "Conduct user research and usability testing",
      "Collaborate with product managers and engineers",
      "Design visual elements and user interfaces",
      "Create and maintain design systems",
    ],
    requirements: [
      "3+ years of experience in UX/UI design",
      "Proficiency in design tools (Figma, Sketch, Adobe XD)",
      "Portfolio demonstrating strong visual design skills",
      "Experience with user research and usability testing",
      "Understanding of accessibility standards",
    ],
    benefits: [
      "Competitive compensation",
      "Health insurance",
      "Flexible working hours",
      "Professional development opportunities",
      "Microsoft product discounts",
    ],
    applicationUrl: "https://careers.microsoft.com",
    applyInApp: false,
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "Equity Bank",
    location: "Nairobi, Kenya",
    salary: "KSh 140,000 - 190,000",
    type: "Full-time",
    posted: "5 days ago",
    logo: "/placeholder.svg?height=60&width=60",
    description:
      "Equity Bank is looking for a Data Scientist to help us extract insights from our vast amounts of data. You will work on building models to predict customer behavior and improve our services.",
    responsibilities: [
      "Develop machine learning models for various business problems",
      "Analyze large datasets to extract insights",
      "Create data visualizations and reports",
      "Collaborate with business stakeholders to understand requirements",
      "Implement and deploy models to production",
    ],
    requirements: [
      "Master's degree in Statistics, Computer Science, or related field",
      "3+ years of experience in data science or machine learning",
      "Proficiency in Python, R, or similar languages",
      "Experience with SQL and database querying",
      "Knowledge of machine learning frameworks (TensorFlow, PyTorch, scikit-learn)",
    ],
    benefits: [
      "Competitive salary",
      "Medical insurance",
      "Retirement benefits",
      "Professional development opportunities",
      "Employee banking benefits",
    ],
    applicationUrl: "https://careers.equitybank.co.ke",
    applyInApp: true,
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Twiga Foods",
    location: "Nairobi, Kenya",
    salary: "KSh 120,000 - 160,000",
    type: "Full-time",
    posted: "1 day ago",
    logo: "/placeholder.svg?height=60&width=60",
    description:
      "Twiga Foods is seeking a DevOps Engineer to help us build and maintain our infrastructure. You will work on automating our deployment processes and ensuring the reliability of our systems.",
    responsibilities: [
      "Implement and maintain CI/CD pipelines",
      "Manage cloud infrastructure (AWS, GCP)",
      "Automate deployment and monitoring processes",
      "Troubleshoot and resolve infrastructure issues",
      "Collaborate with development teams to improve deployment processes",
    ],
    requirements: [
      "3+ years of experience in DevOps or SRE roles",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Knowledge of containerization (Docker, Kubernetes)",
      "Experience with infrastructure as code (Terraform, CloudFormation)",
      "Familiarity with monitoring and logging tools",
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "Flexible working hours",
      "Professional development budget",
      "Stock options",
    ],
    applicationUrl: "https://careers.twiga.com",
    applyInApp: true,
  },
]

export default function JobBoardPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [selectedJob, setSelectedJob] = useState(jobs[0])
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const { toast } = useToast()

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "" || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

  const handleApply = (job: any) => {
    setSelectedJob(job)
    setIsApplyDialogOpen(true)
  }

  const handleExternalApply = (url: string) => {
    window.open(url, "_blank")
    toast({
      title: "Redirecting to external site",
      description: "You are being redirected to the company's career page to complete your application.",
    })
  }

  const handleSaveJob = (jobId: number) => {
    toast({
      title: "Job saved",
      description: "This job has been saved to your profile.",
    })
  }

  const handleShareJob = (jobId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/job/${jobId}`)
    toast({
      title: "Link copied",
      description: "Job link has been copied to clipboard.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <p className="text-muted-foreground">Find your next opportunity from top companies in Kenya</p>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Adjusted the width ratio to make the job preview larger */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search jobs by title or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full">
                <Input
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedJob.id === job.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={job.logo || "/placeholder.svg"}
                            alt={job.company}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{job.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={job.type === "Full-time" ? "default" : "outline"} className="text-xs">
                              {job.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{job.posted}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No jobs found matching your criteria</p>
                </div>
              )}
            </div>
          </div>

          {/* Increased the width of the job preview section */}
          <div className="w-full md:w-2/3">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={selectedJob.logo || "/placeholder.svg"}
                        alt={selectedJob.company}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedJob.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1 text-base">
                        <Building className="mr-1 h-4 w-4" />
                        {selectedJob.company}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={selectedJob.type === "Full-time" ? "default" : "outline"}>
                          {selectedJob.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {selectedJob.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {selectedJob.salary}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {selectedJob.posted}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShareJob(selectedJob.id)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleSaveJob(selectedJob.id)}>
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-350px)] overflow-y-auto">
                <Tabs defaultValue="description">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="space-y-4">
                    <p className="text-base leading-relaxed">{selectedJob.description}</p>
                  </TabsContent>
                  <TabsContent value="responsibilities" className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedJob.responsibilities.map((item, index) => (
                        <li key={index} className="text-base leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="requirements" className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedJob.requirements.map((item, index) => (
                        <li key={index} className="text-base leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="benefits" className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedJob.benefits.map((item, index) => (
                        <li key={index} className="text-base leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t pt-4">
                <div className="flex gap-4 w-full">
                  {selectedJob.applyInApp ? (
                    <Button className="flex-1" onClick={() => handleApply(selectedJob)}>
                      Apply with CV Chap Chap
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExternalApply(selectedJob.applicationUrl)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply on Company Site
                    </Button>
                  )}
                  {selectedJob.applyInApp && selectedJob.applicationUrl && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExternalApply(selectedJob.applicationUrl)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply Externally
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This job was posted on {selectedJob.posted}. Apply soon to increase your chances!
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Apply for {selectedJob.title} at {selectedJob.company}
            </DialogTitle>
            <DialogDescription>
              Complete your application below or apply directly on the company website.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resume" className="text-right">
                Resume
              </Label>
              <div className="col-span-3">
                <Select defaultValue="resume1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume1">My Professional Resume</SelectItem>
                    <SelectItem value="resume2">Software Developer Resume</SelectItem>
                    <SelectItem value="resume3">Marketing Resume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coverLetter" className="text-right">
                Cover Letter
              </Label>
              <div className="col-span-3">
                <Select defaultValue="custom">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cover letter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter1">General Cover Letter</SelectItem>
                    <SelectItem value="letter2">Tech Cover Letter</SelectItem>
                    <SelectItem value="custom">Custom Cover Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Write a custom message to the hiring manager..."
                className="col-span-3"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            {selectedJob.applicationUrl && (
              <Button variant="outline" onClick={() => handleExternalApply(selectedJob.applicationUrl)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply on Company Site
              </Button>
            )}
            <Button
              type="submit"
              onClick={() => {
                toast({
                  title: "Application submitted",
                  description: "Your application has been submitted successfully.",
                })
                setIsApplyDialogOpen(false)
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
