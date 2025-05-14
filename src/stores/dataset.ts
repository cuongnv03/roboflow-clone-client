import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import datasetService from '@/services/datasetService'
import type {
  DatasetResponseDTO,
  DatasetCreateDTO,
  DatasetSplitDTO,
  DatasetImageAssignDTO,
  DatasetExportOptionsDTO,
  DatasetExportResultDTO,
} from '@/types/dataset'
import { useImageStore } from './image'

export const useDatasetStore = defineStore('dataset', () => {
  // State
  const datasets = ref<DatasetResponseDTO[]>([])
  const activeDataset = ref<DatasetResponseDTO | null>(null)
  const datasetImages = ref<Array<{ id: number; split: string }>>([])
  const loading = ref(false)
  const exportLoading = ref(false)
  const error = ref<string | null>(null)
  const exportFormats = ref<string[]>([])
  const exportPreview = ref<string | null>(null)
  const exportResult = ref<DatasetExportResultDTO | null>(null)

  // Getters
  const datasetList = computed(() => datasets.value)
  const isLoading = computed(() => loading.value)
  const isExporting = computed(() => exportLoading.value)
  const datasetError = computed(() => error.value)
  const imagesByTrainSplit = computed(() => {
    const result: Record<string, number[]> = {
      train: [],
      valid: [],
      test: [],
    }

    datasetImages.value.forEach((img) => {
      if (result[img.split]) {
        result[img.split].push(img.id)
      }
    })

    return result
  })

  // Actions
  async function fetchDatasets(projectId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const fetchedDatasets = await datasetService.getProjectDatasets(projectId)
      datasets.value = fetchedDatasets
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch datasets'
      console.error('Error fetching datasets:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDataset(datasetId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const dataset = await datasetService.getDataset(datasetId)
      activeDataset.value = dataset

      // Fetch dataset images
      await fetchDatasetImages(datasetId)
    } catch (err: any) {
      error.value = err.message || `Failed to fetch dataset ${datasetId}`
      console.error(`Error fetching dataset ${datasetId}:`, err)
      activeDataset.value = null
    } finally {
      loading.value = false
    }
  }

  async function createDataset(data: DatasetCreateDTO): Promise<DatasetResponseDTO> {
    loading.value = true
    error.value = null

    try {
      const newDataset = await datasetService.createDataset(data)
      datasets.value = [newDataset, ...datasets.value]
      return newDataset
    } catch (err: any) {
      error.value = err.message || 'Failed to create dataset'
      console.error('Error creating dataset:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDataset(datasetId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await datasetService.deleteDataset(datasetId)
      datasets.value = datasets.value.filter((d) => d.id !== datasetId)

      // Clear active dataset if it's the one being deleted
      if (activeDataset.value?.id === datasetId) {
        activeDataset.value = null
      }
    } catch (err: any) {
      error.value = err.message || `Failed to delete dataset ${datasetId}`
      console.error(`Error deleting dataset ${datasetId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function generateSplit(datasetId: number, splitConfig: DatasetSplitDTO): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const updatedDataset = await datasetService.generateSplit(datasetId, splitConfig)

      // Update in lists
      const index = datasets.value.findIndex((d) => d.id === datasetId)
      if (index !== -1) {
        datasets.value[index] = updatedDataset
      }

      // Update active dataset if needed
      if (activeDataset.value?.id === datasetId) {
        activeDataset.value = updatedDataset
      }

      // Refresh dataset images
      await fetchDatasetImages(datasetId)
    } catch (err: any) {
      error.value = err.message || 'Failed to generate dataset split'
      console.error('Error generating dataset split:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignImagesToSplit(
    datasetId: number,
    assignData: DatasetImageAssignDTO,
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const updatedDataset = await datasetService.assignImagesToSplit(datasetId, assignData)

      // Update in lists
      const index = datasets.value.findIndex((d) => d.id === datasetId)
      if (index !== -1) {
        datasets.value[index] = updatedDataset
      }

      // Update active dataset if needed
      if (activeDataset.value?.id === datasetId) {
        activeDataset.value = updatedDataset
      }

      // Refresh dataset images
      await fetchDatasetImages(datasetId)
    } catch (err: any) {
      error.value = err.message || 'Failed to assign images to split'
      console.error('Error assigning images to split:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchDatasetImages(datasetId: number, split?: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const images = await datasetService.getDatasetImages(datasetId, split)
      datasetImages.value = images || [] // Đảm bảo luôn có mảng, ngay cả khi null
    } catch (err: any) {
      console.error('Error fetching dataset images:', err)
      // Sử dụng mảng trống khi có lỗi
      datasetImages.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchExportFormats(projectType: string): Promise<void> {
    try {
      const formats = await datasetService.getExportFormats(projectType)
      exportFormats.value = formats
    } catch (err: any) {
      console.error('Error fetching export formats:', err)
    }
  }

  async function fetchExportPreview(datasetId: number, format: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const preview = await datasetService.getExportPreview(datasetId, format)
      exportPreview.value = preview.sample
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch export preview'
      console.error('Error fetching export preview:', err)
    } finally {
      loading.value = false
    }
  }

  async function exportDataset(
    datasetId: number,
    options: DatasetExportOptionsDTO,
  ): Promise<DatasetExportResultDTO> {
    exportLoading.value = true
    error.value = null

    try {
      const result = await datasetService.exportDataset(datasetId, options)
      exportResult.value = result
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to export dataset'
      console.error('Error exporting dataset:', err)
      throw err
    } finally {
      exportLoading.value = false
    }
  }

  async function generateDataset(datasetId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const updatedDataset = await datasetService.generateDataset(datasetId)

      // Update in lists
      const index = datasets.value.findIndex((d) => d.id === datasetId)
      if (index !== -1) {
        datasets.value[index] = updatedDataset
      }

      // Update active dataset if needed
      if (activeDataset.value?.id === datasetId) {
        activeDataset.value = updatedDataset
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to generate dataset'
      console.error('Error generating dataset:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset state
  function resetState(): void {
    datasets.value = []
    activeDataset.value = null
    datasetImages.value = []
    loading.value = false
    exportLoading.value = false
    error.value = null
    exportFormats.value = []
    exportPreview.value = null
    exportResult.value = null
  }

  return {
    // State
    datasets,
    activeDataset,
    datasetImages,
    loading,
    exportLoading,
    error,
    exportFormats,
    exportPreview,
    exportResult,

    // Getters
    datasetList,
    isLoading,
    isExporting,
    datasetError,
    imagesByTrainSplit,

    // Actions
    fetchDatasets,
    fetchDataset,
    createDataset,
    deleteDataset,
    generateSplit,
    assignImagesToSplit,
    fetchDatasetImages,
    fetchExportFormats,
    fetchExportPreview,
    exportDataset,
    generateDataset,
    resetState,
  }
})
