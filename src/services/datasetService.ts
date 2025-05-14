import axios from 'axios'
import type {
  DatasetCreateDTO,
  DatasetResponseDTO,
  DatasetSplitDTO,
  DatasetImageAssignDTO,
  DatasetExportOptionsDTO,
  DatasetExportResultDTO,
} from '@/types/dataset'

/**
 * Create a new dataset
 */
const createDataset = async (data: DatasetCreateDTO): Promise<DatasetResponseDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      '/datasets',
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformDataset(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to create dataset')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create dataset')
    }
    throw error
  }
}

/**
 * Get a dataset by ID
 */
const getDataset = async (datasetId: number): Promise<DatasetResponseDTO> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformDataset(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to fetch dataset')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch dataset')
    }
    throw error
  }
}

/**
 * Get all datasets for a project
 */
const getProjectDatasets = async (projectId: number): Promise<DatasetResponseDTO[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any[] }>(
      `/datasets/project/${projectId}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.map(transformDataset)
    }

    throw new Error(response.data.message || 'Failed to fetch datasets')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch datasets')
    }
    throw error
  }
}

/**
 * Delete a dataset
 */
const deleteDataset = async (datasetId: number): Promise<void> => {
  try {
    const response = await axios.delete<{ status: string; message: string }>(
      `/datasets/${datasetId}`,
    )

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to delete dataset')
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete dataset')
    }
    throw error
  }
}

/**
 * Generate dataset splits based on configuration
 */
const generateSplit = async (
  datasetId: number,
  splitConfig: DatasetSplitDTO,
): Promise<DatasetResponseDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}/split`,
      splitConfig,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformDataset(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to generate dataset split')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to generate dataset split')
    }
    throw error
  }
}

/**
 * Assign images to dataset splits
 */
const assignImagesToSplit = async (
  datasetId: number,
  assignData: DatasetImageAssignDTO,
): Promise<DatasetResponseDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}/assign`,
      assignData,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformDataset(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to assign images to split')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to assign images to split')
    }
    throw error
  }
}

/**
 * Get images assigned to a dataset, optionally filtered by split
 */
const getDatasetImages = async (
  datasetId: number,
  split?: string,
): Promise<Array<{ id: number; split: string }>> => {
  try {
    const url = `/datasets/${datasetId}/images${split ? `?split=${split}` : ''}`
    const response = await axios.get<{ status: string; message: string; data: any[] }>(url)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    // Trả về mảng trống nếu không có dữ liệu
    console.warn('No dataset images found')
    return []
  } catch (error: any) {
    console.error('Error fetching dataset images:', error)

    // Trả về mảng trống để UI không bị vỡ
    return []
  }
}

/**
 * Get available export formats for a project type
 */
const getExportFormats = async (projectType: string): Promise<string[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: string[] }>(
      `/datasets/formats?projectType=${projectType}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch export formats')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch export formats')
    }
    throw error
  }
}

/**
 * Export dataset with provided options
 */
const exportDataset = async (
  datasetId: number,
  options: DatasetExportOptionsDTO,
): Promise<DatasetExportResultDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}/export`,
      options,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data as DatasetExportResultDTO
    }

    throw new Error(response.data.message || 'Failed to export dataset')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to export dataset')
    }
    throw error
  }
}

/**
 * Get a preview of the export format
 */
const getExportPreview = async (datasetId: number, format: string): Promise<{ sample: string }> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}/export-preview?format=${format}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to generate export preview')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to generate export preview')
    }
    throw error
  }
}

/**
 * Generate dataset (process and prepare data)
 */
const generateDataset = async (datasetId: number): Promise<DatasetResponseDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/datasets/${datasetId}/generate`,
      {},
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformDataset(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to generate dataset')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to generate dataset')
    }
    throw error
  }
}

// Helper function to transform dataset data from API
const transformDataset = (data: any): DatasetResponseDTO => {
  return {
    id: data.id,
    projectId: data.projectId,
    name: data.name,
    status: data.status,
    createdDate: data.createdDate,
    preprocessing: data.preprocessing,
    augmentation: data.augmentation,
    imageCount: data.imageCount || {
      train: 0,
      valid: 0,
      test: 0,
      total: 0,
    },
  }
}

export default {
  createDataset,
  getDataset,
  getProjectDatasets,
  deleteDataset,
  generateSplit,
  assignImagesToSplit,
  getDatasetImages,
  getExportFormats,
  exportDataset,
  getExportPreview,
  generateDataset,
}
