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

export interface ImageFile {
  id: string
  url: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  tags: string[]
  isAnnotated: boolean
  batchName: string
  isUploading?: boolean
  uploadProgress?: number
  uploadError?: string
}

export interface ServerImageResponse {
  id: number
  projectId: number
  url: string
  filePath: string
  originalFilename: string
  width: number
  height: number
  uploadDate: string
  status: 'uploaded' | 'annotated' | 'processed'
  batchName?: string
  tags?: string[]
}
