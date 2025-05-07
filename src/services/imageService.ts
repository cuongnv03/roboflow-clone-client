import axios from 'axios'
import type { ImageUploadOptions, ServerImageResponse } from '@/types/image'

interface ApiResponse<T> {
  status: string
  message: string
  data?: T
}

// Upload a single image
const uploadImage = async (
  file: File,
  projectId: number,
  options: ImageUploadOptions = {},
): Promise<ServerImageResponse> => {
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

    const response = await axios.post<ApiResponse<ServerImageResponse>>(
      `/projects/${projectId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // You can track individual file progress here
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100),
          )
          console.log(`Upload progress: ${percentCompleted}%`)
        },
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
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
): Promise<ServerImageResponse[]> => {
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

    const response = await axios.post<ApiResponse<{ uploadedImages: ServerImageResponse[] }>>(
      `/projects/${projectId}/images/batch-upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100),
          )
          console.log(`Batch upload progress: ${percentCompleted}%`)
        },
      },
    )

    if (response.data.status === 'success' && response.data.data?.uploadedImages) {
      return response.data.data.uploadedImages
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
const getProjectImages = async (
  projectId: number,
  batchName?: string,
): Promise<ServerImageResponse[]> => {
  try {
    const url = `/projects/${projectId}/images${batchName ? `?batchName=${encodeURIComponent(batchName)}` : ''}`
    const response = await axios.get<ApiResponse<ServerImageResponse[]>>(url)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch images')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch images')
    }
    throw error
  }
}

// Delete an image
const deleteImage = async (projectId: number, imageId: number): Promise<boolean> => {
  try {
    const response = await axios.delete<ApiResponse<null>>(
      `/projects/${projectId}/images/${imageId}`,
    )

    if (response.data.status === 'success') {
      return true
    }

    throw new Error(response.data.message || 'Failed to delete image')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete image')
    }
    throw error
  }
}

// Update image metadata (tags, annotations)
const updateImageMetadata = async (
  projectId: number,
  imageId: number,
  metadata: {
    tags?: string[]
    isAnnotated?: boolean
  },
): Promise<ServerImageResponse> => {
  try {
    const response = await axios.patch<ApiResponse<ServerImageResponse>>(
      `/projects/${projectId}/images/${imageId}/metadata`,
      metadata,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to update image metadata')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update image metadata')
    }
    throw error
  }
}

export default {
  uploadImage,
  uploadMultipleImages,
  getProjectImages,
  deleteImage,
  updateImageMetadata,
}
