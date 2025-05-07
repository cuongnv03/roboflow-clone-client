export interface ImageUploadOptions {
  batchName?: string
  resize?: {
    width?: number
    height?: number
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  }
  format?: 'jpeg' | 'png' | 'webp'
  tags?: string[]
}

export interface Image {
  id: number
  projectId: number
  filePath: string
  originalFilename: string
  width: number
  height: number
  uploadDate: string
  status: 'uploaded' | 'annotated' | 'processed'
  tags: string[]
  batchName?: string
}

export interface TempImage {
  id: string // Client-side ID, will use UUID
  file: File
  previewUrl: string
  name: string
  size: number
  type: string
  isUploading?: boolean
}

export interface UploadResponse {
  uploadedImages: Image[]
  failedUploads: Array<{ filename: string; error: string }>
  totalUploaded: number
  totalFailed: number
}
