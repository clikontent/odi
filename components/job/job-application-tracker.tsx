"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as ShadcnBadge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building, Calendar, Clock, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ApplicationStatus = "applied" | "interview" | "offer" | "rejected" | "saved"

interface JobApplication {
  id: string
  company: string
  position: string
  location: string
  status: ApplicationStatus
  appliedDate: string
  notes: string
  nextStep?: string
  nextStepDate?: string
}

export function JobApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: "1",
      company: "Tech Innovations Ltd",
      position: "Senior Software Engineer",
      location: "Nairobi, Kenya",
      status: "interview",
      appliedDate: "2023-07-15",
      notes: "Had first interview on July 20. Technical assessment scheduled.",
      nextStep: "Technical Interview",
      nextStepDate: "2023-07-25",
    },
    {
      id: "2",
      company: "Digital Solutions Inc",
      position: "Frontend Developer",
      location: "Remote",
      status: "applied",
      appliedDate: "2023-07-18",
      notes: "Applied through company website. Used tailored resume version 2.",
    },
    {
      id: "3",
      company: "Global Systems",
      position: "Full Stack Engineer",
      location: "Mombasa, Kenya",
      status: "rejected",
      appliedDate: "2023-07-05",
      notes: "Received rejection email on July 12. Cited lack of specific industry experience.",
    },
    {
      id: "4",
      company: "Innovative Tech",
      position: "Product Manager",
      location: "Nairobi, Kenya",
      status: "saved",
      appliedDate: "",
      notes: "Interesting position, need to tailor resume and cover letter before applying.",
    },
  ])

  const [newApplication, setNewApplication] = useState<Omit<JobApplication, "id">>({
    company: "",
    position: "",
    location: "",
    status: "applied",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleAddApplication = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setApplications([...applications, { ...newApplication, id }])
    setNewApplication({
      company: "",
      position: "",
      location: "",
      status: "applied",
      appliedDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditApplication = () => {
    if (!editingApplication) return

    setApplications(applications.map((app) => (app.id === editingApplication.id ? editingApplication : app)))
    setEditingApplication(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteApplication = (id: string) => {
    setApplications(applications.filter((app) => app.id !== id))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewApplication({ ...newApplication, [name]: value })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingApplication) return

    const { name, value } = e.target
    setEditingApplication({ ...editingApplication, [name]: value })
  }

  const handleStatusChange = (value: string) => {
    setNewApplication({ ...newApplication, status: value as ApplicationStatus })
  }

  const handleEditStatusChange = (value: string) => {
    if (!editingApplication) return

    setEditingApplication({ ...editingApplication, status: value as ApplicationStatus })
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return <ShadcnBadge variant="secondary">Applied</ShadcnBadge>
      case "interview":
        return <ShadcnBadge variant="default">Interview</ShadcnBadge>
      case "offer":
        return <ShadcnBadge variant="success">Offer</ShadcnBadge>
      case "rejected":
        return <ShadcnBadge variant="destructive">Rejected</ShadcnBadge>
      case "saved":
        return <ShadcnBadge variant="outline">Saved</ShadcnBadge>
    }
  }

  const filterApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter((app) => app.status === status)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>Track your job applications and interviews</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Job Application</DialogTitle>
              <DialogDescription>Track a new job application or save a job for later</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={newApplication.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={newApplication.position}
                  onChange={handleInputChange}
                  placeholder="Job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={newApplication.location}
                  onChange={handleInputChange}
                  placeholder="Job location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newApplication.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newApplication.status !== "saved" && (
                <div className="space-y-2">
                  <Label htmlFor="appliedDate">Applied Date</Label>
                  <Input
                    id="appliedDate"
                    name="appliedDate"
                    type="date"
                    value={newApplication.appliedDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newApplication.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this application"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddApplication}>Add Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Job Application</DialogTitle>
              <DialogDescription>Update the details of your job application</DialogDescription>
            </DialogHeader>
            {editingApplication && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    name="company"
                    value={editingApplication.company}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    name="position"
                    value={editingApplication.position}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    value={editingApplication.location}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingApplication.status} onValueChange={handleEditStatusChange}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingApplication.status !== "saved" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-appliedDate">Applied Date</Label>
                    <Input
                      id="edit-appliedDate"
                      name="appliedDate"
                      type="date"
                      value={editingApplication.appliedDate}
                      onChange={handleEditInputChange}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={editingApplication.notes}
                    onChange={handleEditInputChange}
                    rows={3}
                  />
                </div>
                {(editingApplication.status === "interview" || editingApplication.status === "offer") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-nextStep">Next Step</Label>
                      <Input
                        id="edit-nextStep"
                        name="nextStep"
                        value={editingApplication.nextStep || ""}
                        onChange={handleEditInputChange}
                        placeholder="e.g., Technical Interview"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-nextStepDate">Next Step Date</Label>
                      <Input
                        id="edit-nextStepDate"
                        name="nextStepDate"
                        type="date"
                        value={editingApplication.nextStepDate || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditApplication}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="offer">Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 pt-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={() => {
                    setEditingApplication(application)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteApplication(application.id)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 pt-4">
            {filterApplicationsByStatus("saved").length > 0 ? (
              filterApplicationsByStatus("saved").map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={() => {
                    setEditingApplication(application)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteApplication(application.id)}
                />
              ))
            ) : (
              <EmptyState status="saved" />
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4 pt-4">
            {filterApplicationsByStatus("applied").length > 0 ? (
              filterApplicationsByStatus("applied").map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={() => {
                    setEditingApplication(application)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteApplication(application.id)}
                />
              ))
            ) : (
              <EmptyState status="applied" />
            )}
          </TabsContent>

          <TabsContent value="interview" className="space-y-4 pt-4">
            {filterApplicationsByStatus("interview").length > 0 ? (
              filterApplicationsByStatus("interview").map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={() => {
                    setEditingApplication(application)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteApplication(application.id)}
                />
              ))
            ) : (
              <EmptyState status="interview" />
            )}
          </TabsContent>

          <TabsContent value="offer" className="space-y-4 pt-4">
            {filterApplicationsByStatus("offer").length > 0 ? (
              filterApplicationsByStatus("offer").map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={() => {
                    setEditingApplication(application)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteApplication(application.id)}
                />
              ))
            ) : (
              <EmptyState status="offer" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ApplicationCardProps {
  application: JobApplication
  onEdit: () => void
  onDelete: () => void
}

function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return <ShadcnBadge variant="secondary">Applied</ShadcnBadge>
      case "interview":
        return <ShadcnBadge variant="default">Interview</ShadcnBadge>
      case "offer":
        return <ShadcnBadge variant="success">Offer</ShadcnBadge>
      case "rejected":
        return <ShadcnBadge variant="destructive">Rejected</ShadcnBadge>
      case "saved":
        return <ShadcnBadge variant="outline">Saved</ShadcnBadge>
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{application.position}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Building className="mr-1 h-3 w-3" />
              {application.company}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(application.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {application.status === "saved"
              ? "Not applied yet"
              : `Applied: ${new Date(application.appliedDate).toLocaleDateString()}`}
          </div>
          {application.nextStep && application.nextStepDate && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {`${application.nextStep}: ${new Date(application.nextStepDate).toLocaleDateString()}`}
            </div>
          )}
        </div>

        {application.notes && (
          <div className="mt-3 text-sm">
            <p className="text-muted-foreground">{application.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ status }: { status?: ApplicationStatus }) {
  let message = "No job applications yet"

  if (status) {
    switch (status) {
      case "saved":
        message = "No saved jobs yet"
        break
      case "applied":
        message = "No applications submitted yet"
        break
      case "interview":
        message = "No interviews scheduled yet"
        break
      case "offer":
        message = "No offers received yet"
        break
      case "rejected":
        message = "No rejections received yet"
        break
    }
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="text-lg font-medium">{message}</h3>
      <p className="text-muted-foreground mt-2">Track your job applications to stay organized during your job search</p>
    </div>
  )
}

