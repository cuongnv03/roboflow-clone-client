import axios from 'axios'
import type { Annotation, AnnotationCreateParams } from '@/types/annotation'

// Create a new annotation
const createAnnotation = async (params: AnnotationCreateParams): Promise<Annotation> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      '/annotations',
      {
        imageId: params.imageId,
        classId: params.classId,
        data: params.data,
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformAnnotation(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to create annotation')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create annotation')
    }
    throw error
  }
}

// Get annotations for an image
const getImageAnnotations = async (imageId: number): Promise<Annotation[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any[] }>(
      `/annotations/images/${imageId}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.map(transformAnnotation)
    }

    throw new Error(response.data.message || 'Failed to fetch annotations')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch annotations')
    }
    throw error
  }
}

// Update an annotation
const updateAnnotation = async (
  annotationId: number,
  data: Partial<Omit<Annotation, 'id' | 'imageId'>>,
): Promise<Annotation> => {
  try {
    const response = await axios.put<{ status: string; message: string; data: any }>(
      `/annotations/${annotationId}`,
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformAnnotation(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to update annotation')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update annotation')
    }
    throw error
  }
}

// Delete an annotation
const deleteAnnotation = async (annotationId: number): Promise<void> => {
  try {
    const response = await axios.delete<{ status: string; message: string }>(
      `/annotations/${annotationId}`,
    )

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to delete annotation')
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete annotation')
    }
    throw error
  }
}

// Batch create annotations
const batchCreateAnnotations = async (
  imageId: number,
  annotations: Array<Omit<AnnotationCreateParams, 'imageId'>>,
): Promise<Annotation[]> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any[] }>(
      '/annotations/batch',
      {
        imageId,
        annotations: annotations.map((ann) => ({
          classId: ann.classId,
          data: ann.data,
        })),
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.map(transformAnnotation)
    }

    throw new Error(response.data.message || 'Failed to create annotations')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create annotations')
    }
    throw error
  }
}

// Helper function to transform annotation data from API
const transformAnnotation = (data: any): Annotation => {
  return {
    id: data.id || data.annotation_id,
    imageId: data.imageId || data.image_id,
    classId: data.classId || data.class_id,
    className: data.className || data.class_name,
    classColor: data.classColor || data.class_color || '#000000',
    ...data.data,
  } as Annotation
}

export default {
  createAnnotation,
  getImageAnnotations,
  updateAnnotation,
  deleteAnnotation,
  batchCreateAnnotations,
}
