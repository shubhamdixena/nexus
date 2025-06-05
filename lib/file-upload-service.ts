import { put } from "@vercel/blob"
import type { Document } from "@/types"

export class FileUploadService {
  static async uploadFile(file: File, userId: string): Promise<{
    url: string
    filename: string
    size: number
    type: string
  }> {
    try {
      // Generate a unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `${userId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      })

      return {
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      }
    } catch (error) {
      console.error("File upload error:", error)
      throw new Error("Failed to upload file")
    }
  }

  static async deleteFile(url: string): Promise<void> {
    try {
      // Extract the pathname from the blob URL
      const pathname = new URL(url).pathname
      // Note: Vercel Blob doesn't have a direct delete API in the client
      // This would typically be handled on the server side
      console.log("File deletion requested for:", pathname)
    } catch (error) {
      console.error("File deletion error:", error)
      throw new Error("Failed to delete file")
    }
  }

  static validateFile(file: File, options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
  } = {}): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ] } = options

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    return { valid: true }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileTypeIcon(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': '📄',
      'image/jpeg': '🖼️',
      'image/jpg': '🖼️',
      'image/png': '🖼️',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'text/plain': '📄',
      'default': '📎'
    }
    
    return typeMap[mimeType] || typeMap.default
  }
}

// Enhanced Document Service with file upload
export class DocumentUploadService {
  static async uploadDocumentWithFile(
    file: File,
    documentData: {
      user_id: string
      name: string
      type: string
      application_id?: string
    }
  ): Promise<Document> {
    try {
      // Validate file
      const validation = FileUploadService.validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Upload file
      const uploadResult = await FileUploadService.uploadFile(file, documentData.user_id)

      // Create document record
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...documentData,
          file_url: uploadResult.url,
          file_size: uploadResult.size,
          mime_type: uploadResult.type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create document record")
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error("Document upload error:", error)
      throw error
    }
  }

  static async deleteDocumentWithFile(documentId: string, userId: string, fileUrl: string): Promise<void> {
    try {
      // Delete file from storage
      await FileUploadService.deleteFile(fileUrl)
      
      // Delete document record
      await fetch(`/api/documents?id=${documentId}&user_id=${userId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Document deletion error:", error)
      throw error
    }
  }
}