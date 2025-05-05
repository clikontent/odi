"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { supabase, ensureStorageBuckets } from "@/lib/supabase"
import type { UserFile } from "@/types/user"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  File,
  FileText,
  FilePlus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  Share,
  MoreHorizontal,
  FileImage,
  FileIcon as FilePdf,
  FileArchive,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  FileCode,
  FileJson,
} from "lucide-react"

export default function FilesPage() {
  const { user, userStats } = useUser()
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState("all")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // New file form state
  const [newFile, setNewFile] = useState<{
    file: File | null
    description: string
    isPublic: boolean
    tags: string
  }>({
    file: null,
    description: "",
    isPublic: false,
    tags: "",
  })

  useEffect(() => {
    async function fetchFiles() {
      try {
        if (!user) return

        setLoading(true)
        console.log("Fetching files for user:", user.id)

        const { data, error } = await supabase
          .from("user_files")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching files:", error)
          toast({
            title: "Error",
            description: "Failed to load your files. Please refresh the page.",
            variant: "destructive",
          })
          throw error
        }

        console.log(`Successfully fetched ${data?.length || 0} files`)
        setFiles(data as UserFile[])
      } catch (error) {
        console.error("Error in fetchFiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [user])

  // Add this after the other useEffect hooks
  useEffect(() => {
    async function checkStorageBuckets() {
      if (user) {
        const bucketsExist = await ensureStorageBuckets()
        if (!bucketsExist) {
          toast({
            title: "Storage Setup Issue",
            description: "There was a problem setting up file storage. Some features may not work correctly.",
            variant: "destructive",
          })
        }
      }
    }

    checkStorageBuckets()
  }, [user])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !newFile.file) {
      toast({
        title: "Error",
        description: "User not logged in or no file selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadError(null)

      // Upload file to storage
      const fileExt = newFile.file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log("Starting file upload to path:", filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user_files")
        .upload(filePath, newFile.file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(percent)
            console.log(`Upload progress: ${percent}%`)
          },
        })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw uploadError
      }

      console.log("File uploaded successfully:", uploadData)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user_files").getPublicUrl(filePath)

      console.log("Public URL generated:", publicUrl)

      // Create thumbnail for images
      let thumbnailUrl = null
      if (newFile.file.type.startsWith("image/")) {
        const thumbnailPath = `thumbnails/${user.id}/${fileName}`
        console.log("Creating thumbnail at path:", thumbnailPath)

        // In a real app, you would resize the image here
        // For simplicity, we'll just use the same image
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from("user_files")
          .copy(filePath, thumbnailPath)

        if (thumbnailError) {
          console.warn("Thumbnail creation error:", thumbnailError)
        }

        if (thumbnailData) {
          const {
            data: { publicUrl: thumbUrl },
          } = supabase.storage.from("user_files").getPublicUrl(thumbnailPath)

          thumbnailUrl = thumbUrl
          console.log("Thumbnail URL generated:", thumbnailUrl)
        }
      }

      // Save file metadata to database
      console.log("Saving file metadata to database")
      const fileMetadata = {
        user_id: user.id,
        name: newFile.file.name,
        type: newFile.file.type,
        size: newFile.file.size,
        url: publicUrl,
        path: filePath,
        is_public: newFile.isPublic,
        description: newFile.description,
        thumbnail_url: thumbnailUrl,
        tags: newFile.tags ? newFile.tags.split(",").map((tag) => tag.trim()) : [],
      }

      console.log("File metadata:", fileMetadata)

      const { data: fileData, error: fileError } = await supabase.from("user_files").insert(fileMetadata).select()

      if (fileError) {
        console.error("Database insert error:", fileError)
        throw fileError
      }

      console.log("File metadata saved successfully:", fileData)

      // Add new file to the list
      if (fileData && fileData[0]) {
        setFiles([fileData[0] as UserFile, ...files])
      }

      // Reset form
      setNewFile({
        file: null,
        description: "",
        isPublic: false,
        tags: "",
      })

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "upload",
        entity_type: "file",
        entity_id: fileData?.[0]?.id,
        details: { file_name: newFile.file.name, file_size: newFile.file.size },
      })

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      })
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setUploadError(error.message || "Failed to upload file. Please try again.")
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile({ ...newFile, file: e.target.files[0] })
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const fileToDelete = files.find((f) => f.id === fileId)

      if (!fileToDelete) return

      // Delete file from storage
      const { error: storageError } = await supabase.storage.from("user_files").remove([fileToDelete.path])

      if (storageError) throw storageError

      // Delete thumbnail if exists
      if (fileToDelete.thumbnail_url) {
        const thumbnailPath = `thumbnails/${fileToDelete.path}`
        await supabase.storage.from("user_files").remove([thumbnailPath])
      }

      // Delete file metadata from database
      const { error: dbError } = await supabase.from("user_files").delete().eq("id", fileId)

      if (dbError) throw dbError

      // Remove file from list
      setFiles(files.filter((f) => f.id !== fileId))

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        action: "delete",
        entity_type: "file",
        entity_id: fileId,
        details: { file_name: fileToDelete.name },
      })

      alert("File deleted successfully!")
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("Failed to delete file. Please try again.")
    }
  }

  const handleDownloadFile = async (file: UserFile) => {
    try {
      // Get file from storage
      const { data, error } = await supabase.storage.from("user_files").download(file.path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        action: "download",
        entity_type: "file",
        entity_id: file.id,
        details: { file_name: file.name },
      })
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId))
    } else {
      setSelectedFiles([...selectedFiles, fileId])
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return

    try {
      // Get files to delete
      const filesToDelete = files.filter((f) => selectedFiles.includes(f.id))

      // Delete files from storage
      const filePaths = filesToDelete.map((f) => f.path)
      const { error: storageError } = await supabase.storage.from("user_files").remove(filePaths)

      if (storageError) throw storageError

      // Delete thumbnails if exist
      const thumbnailPaths = filesToDelete.filter((f) => f.thumbnail_url).map((f) => `thumbnails/${f.path}`)

      if (thumbnailPaths.length > 0) {
        await supabase.storage.from("user_files").remove(thumbnailPaths)
      }

      // Delete file metadata from database
      const { error: dbError } = await supabase.from("user_files").delete().in("id", selectedFiles)

      if (dbError) throw dbError

      // Remove files from list
      setFiles(files.filter((f) => !selectedFiles.includes(f.id)))

      // Reset selection
      setSelectedFiles([])

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        action: "bulk_delete",
        entity_type: "file",
        details: { file_count: selectedFiles.length, file_names: filesToDelete.map((f) => f.name) },
      })

      alert("Files deleted successfully!")
    } catch (error) {
      console.error("Error deleting files:", error)
      alert("Failed to delete files. Please try again.")
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileImage className="h-10 w-10 text-blue-500" />
    if (fileType === "application/pdf") return <FilePdf className="h-10 w-10 text-red-500" />
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return <FileArchive className="h-10 w-10 text-yellow-500" />
    if (fileType.startsWith("audio/")) return <FileAudio className="h-10 w-10 text-purple-500" />
    if (fileType.startsWith("video/")) return <FileVideo className="h-10 w-10 text-pink-500" />
    if (
      fileType.includes("javascript") ||
      fileType.includes("typescript") ||
      fileType.includes("html") ||
      fileType.includes("css")
    )
      return <FileCode className="h-10 w-10 text-teal-500" />
    if (fileType.includes("json")) return <FileJson className="h-10 w-10 text-amber-500" />
    return <FileText className="h-10 w-10 text-gray-500" />
  }

  const filteredFiles = files.filter((file) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.tags && file.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

    // Filter by tab
    let matchesTab = true
    if (selectedTab === "images") {
      matchesTab = file.type.startsWith("image/")
    } else if (selectedTab === "documents") {
      matchesTab =
        file.type.includes("pdf") ||
        file.type.includes("word") ||
        file.type.includes("text") ||
        file.type.includes("document")
    } else if (selectedTab === "other") {
      matchesTab =
        !file.type.startsWith("image/") &&
        !file.type.includes("pdf") &&
        !file.type.includes("word") &&
        !file.type.includes("text") &&
        !file.type.includes("document")
    }

    return matchesSearch && matchesTab
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Files</h1>
              <p className="text-muted-foreground">Manage your uploaded files and documents</p>
            </div>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>Upload a new file to your storage. Maximum file size is 10MB.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleFileUpload}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="file">File</Label>
                        <Input id="file" type="file" onChange={handleFileChange} required />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                          id="description"
                          value={newFile.description}
                          onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
                          placeholder="Enter a description for this file"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated, optional)</Label>
                        <Input
                          id="tags"
                          value={newFile.tags}
                          onChange={(e) => setNewFile({ ...newFile, tags: e.target.value })}
                          placeholder="e.g. resume, cover letter, certificate"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPublic"
                          checked={newFile.isPublic}
                          onCheckedChange={(checked) => setNewFile({ ...newFile, isPublic: checked as boolean })}
                        />
                        <label
                          htmlFor="isPublic"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Make this file publicly accessible
                        </label>
                      </div>

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}

                      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isUploading || !newFile.file}>
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {selectedFiles.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedFiles.length})
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Checkbox id="filter-images" className="mr-2" />
                    <label htmlFor="filter-images">Images</label>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Checkbox id="filter-documents" className="mr-2" />
                    <label htmlFor="filter-documents">Documents</label>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Checkbox id="filter-public" className="mr-2" />
                    <label htmlFor="filter-public">Public files</label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="p-4 pb-0">
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All Files</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-4">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No files yet</h3>
                  <p className="text-muted-foreground mb-4">Upload your first file to get started</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content is the same as above */}
                  </Dialog>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No files match your search criteria</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden">
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                          />
                        </div>

                        <div className="h-40 flex items-center justify-center bg-muted p-4">
                          {file.type.startsWith("image/") && file.thumbnail_url ? (
                            <img
                              src={file.thumbnail_url || "/placeholder.svg"}
                              alt={file.name}
                              className="h-full object-contain"
                            />
                          ) : (
                            getFileIcon(file.type)
                          )}
                        </div>
                      </div>

                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base truncate">{file.name}</CardTitle>
                        <CardDescription className="truncate">
                          {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className="p-4 pt-2 flex justify-between">
                        <div className="flex gap-1">
                          {file.is_public && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )}
                          {file.tags && file.tags.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {file.tags[0]}
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <Checkbox
                          checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFiles(filteredFiles.map((f) => f.id))
                            } else {
                              setSelectedFiles([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {file.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.type.split("/")[1] || file.type}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(file.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>

            <CardFooter className="p-4 border-t">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  {filteredFiles.length} of {files.length} files
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Storage used: {formatFileSize(userStats?.storage_used || 0)} of{" "}
                    {formatFileSize(userStats?.storage_limit || 0)}
                  </p>
                  <Progress
                    value={((userStats?.storage_used || 0) / (userStats?.storage_limit || 1)) * 100}
                    className="h-2 w-24"
                  />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
