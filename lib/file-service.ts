import { createClient } from "@supabase/supabase-js"
import type { UserFile } from "@/types/user"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = "user_files"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export type UploadProgressCallback = (progress: number) => void

export interface FileUploadOptions {
  file: File
  userId: string
  description?: string
  isPublic?: boolean
  tags?: string[]
  onProgress?: UploadProgressCallback
}

export interface FileUploadResult {
  success: boolean
  message: string
  fileData?: UserFile
  error?: any
}

/**
 * Ensure storage buckets exist
 */
export async function ensureStorageBuckets(): Promise<boolean> {
  try {
    // Check if user_files bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error listing buckets:", error)
      return false
    }

    const userFilesBucketExists = buckets.some((bucket) => bucket.name === BUCKET_NAME)

    if (!userFilesBucketExists) {
      console.log(`Creating ${BUCKET_NAME} bucket`)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
      })

      if (createError) {
        console.error(`Error creating ${BUCKET_NAME} bucket:`, createError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring storage buckets:", error)
    return false
  }
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
  const { file, userId, description = "", isPublic = false, tags = [], onProgress } = options

  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      }
    }

    // Ensure buckets exist
    const bucketsExist = await ensureStorageBuckets()
    if (!bucketsExist) {
      return {
        success: false,
        message: "Storage setup failed. Please try again later.",
      }
    }

    // Generate a unique file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      onUploadProgress: (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100)
        if (onProgress) onProgress(percent)
      },
    })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return {
        success: false,
        message: uploadError.message || "Failed to upload file",
        error: uploadError,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    // Create thumbnail for images
    let thumbnailUrl = null
    if (file.type.startsWith("image/")) {
      const thumbnailPath = `thumbnails/${userId}/${fileName}`

      // In a real app, you would resize the image here
      // For simplicity, we'll just use the same image
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from(BUCKET_NAME)
        .copy(filePath, thumbnailPath)

      if (!thumbnailError && thumbnailData) {
        const {
          data: { publicUrl: thumbUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(thumbnailPath)
        thumbnailUrl = thumbUrl
      }
    }

    // Save file metadata to database
    const fileMetadata = {
      user_id: userId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      path: filePath,
      is_public: isPublic,
      description: description,
      thumbnail_url: thumbnailUrl,
      tags: tags,
    }

    const { data: fileData, error: fileError } = await supabase.from("user_files").insert(fileMetadata).select()

    if (fileError) {
      console.error("Database insert error:", fileError)
      // Try to clean up the uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath])
      if (thumbnailUrl) {
        await supabase.storage.from(BUCKET_NAME).remove([`thumbnails/${userId}/${fileName}`])
      }

      return {
        success: false,
        message: fileError.message || "Failed to save file metadata",
        error: fileError,
      }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "file_upload",
      entity_type: "file",
      entity_id: fileData?.[0]?.id,
      activity_details: { file_name: file.name, file_size: file.size },
    })

    return {
      success: true,
      message: "File uploaded successfully",
      fileData: fileData?.[0] as UserFile,
    }
  } catch (error: any) {
    console.error("Error in uploadFile:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      error,
    }
  }
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  try {
    // Get file details
    const { data: fileData, error: fetchError } = await supabase
      .from("user_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !fileData) {
      console.error("Error fetching file:", fetchError)
      return false
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([fileData.path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      return false
    }

    // Delete thumbnail if exists
    if (fileData.thumbnail_url) {
      const thumbnailPath = `thumbnails/${fileData.path}`
      await supabase.storage.from(BUCKET_NAME).remove([thumbnailPath])
    }

    // Delete file metadata from database
    const { error: dbError } = await supabase.from("user_files").delete().eq("id", fileId).eq("user_id", userId)

    if (dbError) {
      console.error("Error deleting file metadata:", dbError)
      return false
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "file_delete",
      entity_type: "file",
      entity_id: fileId,
      activity_details: { file_name: fileData.name },
    })

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    return false
  }
}

/**
 * Get files for a user
 */
export async function getUserFiles(
  userId: string,
  options: {
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
    filter?: {
      type?: string[]
      isPublic?: boolean
      tags?: string[]
      search?: string
    }
  } = {},
): Promise<{ files: UserFile[]; count: number }> {
  try {
    const { sortBy = "created_at", sortOrder = "desc", limit = 100, offset = 0, filter = {} } = options

    // Start building the query
    let query = supabase.from("user_files").select("*", { count: "exact" }).eq("user_id", userId)

    // Apply filters
    if (filter.type && filter.type.length > 0) {
      query = query.in("type", filter.type)
    }

    if (filter.isPublic !== undefined) {
      query = query.eq("is_public", filter.isPublic)
    }

    if (filter.tags && filter.tags.length > 0) {
      // This assumes tags is stored as an array in the database
      // For each tag, we check if it's contained in the tags array
      filter.tags.forEach((tag) => {
        query = query.contains("tags", [tag])
      })
    }

    if (filter.search) {
      query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
    }

    // Apply sorting, pagination
    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(offset, offset + limit - 1)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching user files:", error)
      throw error
    }

    return {
      files: data as UserFile[],
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getUserFiles:", error)
    return { files: [], count: 0 }
  }
}

/**
 * Download a file
 */
export async function downloadFile(fileId: string, userId: string): Promise<{ url: string; fileName: string } | null> {
  try {
    // Get file details
    const { data: fileData, error: fetchError } = await supabase
      .from("user_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !fileData) {
      console.error("Error fetching file:", fetchError)
      return null
    }

    // Get download URL
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(fileData.path, 60) // URL valid for 60 seconds

    if (error) {
      console.error("Error creating download URL:", error)
      return null
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "file_download",
      entity_type: "file",
      entity_id: fileId,
      activity_details: { file_name: fileData.name },
    })

    return {
      url: data.signedUrl,
      fileName: fileData.name,
    }
  } catch (error) {
    console.error("Error in downloadFile:", error)
    return null
  }
}
