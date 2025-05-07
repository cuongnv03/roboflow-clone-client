import axios from 'axios'
import type { Image, ImageUploadOptions, UploadResponse } from '@/types/image'

type ProgressCallback = (progress: number) => void
const SERVER_URL = 'http://localhost:5000'

// Upload a single image
const uploadImage = async (
  file: File,
  projectId: number,
  options: ImageUploadOptions = {},
): Promise<Image> => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    // Add options to form data
    if (options.batchName) {
      formData.append('batchName', options.batchName)
    }

    if (options.resize) {
      formData.append('resize', JSON.stringify(options.resize))
    }

    if (options.tags && options.tags.length) {
      formData.append('tags', JSON.stringify(options.tags))
    }

    if (options.format) {
      formData.append('format', options.format)
    }

    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/projects/${projectId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformImage(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to upload image')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to upload image')
    }
    throw error
  }
}

// Upload multiple images
const uploadMultipleImages = async (
  files: File[],
  projectId: number,
  options: ImageUploadOptions = {},
  onProgress?: ProgressCallback,
): Promise<UploadResponse> => {
  try {
    const formData = new FormData()

    // Append all files
    files.forEach((file) => {
      formData.append('images', file)
    })

    // Add options to form data
    if (options.batchName) {
      formData.append('batchName', options.batchName)
    }

    if (options.resize) {
      formData.append('resize', JSON.stringify(options.resize))
    }

    if (options.tags && options.tags.length) {
      formData.append('tags', JSON.stringify(options.tags))
    }

    if (options.format) {
      formData.append('format', options.format)
    }

    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/projects/${projectId}/images/batch-upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      const { uploadedImages, failedUploads, totalUploaded, totalFailed } = response.data.data

      return {
        uploadedImages: uploadedImages.map(transformImage),
        failedUploads,
        totalUploaded,
        totalFailed,
      }
    }

    throw new Error(response.data.message || 'Failed to upload images')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to upload images')
    }
    throw error
  }
}

// Get all images for a project
const getProjectImages = async (projectId: number, batchName?: string): Promise<Image[]> => {
  try {
    const url = `/projects/${projectId}/images${batchName ? `?batchName=${encodeURIComponent(batchName)}` : ''}`
    const response = await axios.get<{ status: string; message: string; data: any[] }>(url)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.map(transformImage)
    }

    throw new Error(response.data.message || 'Failed to fetch images')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch images')
    }
    throw error
  }
}

// Get project batches
const getProjectBatches = async (projectId: number): Promise<string[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: string[] }>(
      `/projects/${projectId}/images/batches`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch batches')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch batches')
    }
    throw error
  }
}

// Delete an image
const deleteImage = async (projectId: number, imageId: number): Promise<void> => {
  try {
    const response = await axios.delete<{ status: string; message: string }>(
      `/projects/${projectId}/images/${imageId}`,
    )

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to delete image')
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete image')
    }
    throw error
  }
}

// Update image metadata (tags, status)
const updateImageMetadata = async (
  projectId: number,
  imageId: number,
  metadata: {
    tags?: string[]
    status?: 'uploaded' | 'annotated' | 'processed'
  },
): Promise<Image> => {
  try {
    const response = await axios.patch<{ status: string; message: string; data: any }>(
      `/projects/${projectId}/images/${imageId}/metadata`,
      metadata,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformImage(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to update image metadata')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update image metadata')
    }
    throw error
  }
}

// Helper function to transform image data from API
const transformImage = (data: any): Image => {
  const filePath = data.filePath || data.file_path

  // Make the file path a full URL if it's not already
  const fullFilePath = filePath.startsWith('http') ? filePath : `${SERVER_URL}${filePath}`
  return {
    id: data.id || data.image_id,
    projectId: data.projectId || data.project_id,
    filePath: fullFilePath,
    originalFilename: data.originalFilename || data.original_filename,
    width: data.width,
    height: data.height,
    uploadDate: data.uploadDate || data.upload_date,
    status: data.status || 'uploaded',
    tags: data.tags || [],
    batchName: data.batchName || data.batch_name,
  }
}

export default {
  uploadImage,
  uploadMultipleImages,
  getProjectImages,
  getProjectBatches,
  deleteImage,
  updateImageMetadata,
}
