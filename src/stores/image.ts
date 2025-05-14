import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import imageService from '@/services/imageService'
import type { Image, ImageUploadOptions, UploadResponse } from '@/types/image'

export const useImageStore = defineStore('image', () => {
  // State
  const images = ref<Image[]>([])
  const selectedImage = ref<Image | null>(null)
  const selectedImageIds = ref<number[]>([])
  const currentBatchName = ref<string>('Batch ' + new Date().toLocaleDateString())
  const availableTags = ref<string[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  // Getters
  const imageCount = computed(() => images.value.length)
  const hasSelectedImages = computed(() => selectedImageIds.value.length > 0)
  const isLoading = computed(() => loading.value)
  const isUploading = computed(() => uploading.value)

  // Actions
  async function fetchProjectImages(projectId: number, batchName?: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const fetchedImages = await imageService.getProjectImages(projectId, batchName)
      images.value = fetchedImages
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch images'
      console.error('Error fetching images:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadImage(
    file: File,
    projectId: number,
    options: ImageUploadOptions = {},
  ): Promise<Image> {
    uploading.value = true
    error.value = null

    try {
      const response = await imageService.uploadImage(file, projectId, options)
      // Add new image to the list
      images.value = [response, ...images.value]
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to upload image'
      console.error('Error uploading image:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  // src/stores/image.ts - add this to the uploadMultipleImages function

  async function uploadMultipleImages(
    files: File[],
    projectId: number,
    options: ImageUploadOptions = {},
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      // Update tags registry
      if (options.tags) {
        options.tags.forEach((tag) => {
          if (!availableTags.value.includes(tag)) {
            availableTags.value.push(tag)
          }
        })
      }

      // Set current batch name
      if (options.batchName) {
        currentBatchName.value = options.batchName
      }

      // Upload files with progress tracking
      const response = await imageService.uploadMultipleImages(
        files,
        projectId,
        options,
        (progress) => {
          uploadProgress.value = progress
          if (onProgress) onProgress(progress)
        },
      )

      // Add uploaded images to the list
      images.value = [...response.uploadedImages, ...images.value]
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to upload images'
      console.error('Error uploading images:', err)
      throw err
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  async function deleteImage(projectId: number, imageId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await imageService.deleteImage(projectId, imageId)

      // Remove from selected if needed
      if (selectedImage.value?.id === imageId) {
        selectedImage.value = null
      }
      selectedImageIds.value = selectedImageIds.value.filter((id) => id !== imageId)

      // Remove from images array
      images.value = images.value.filter((image) => image.id !== imageId)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete image'
      console.error('Error deleting image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedImages(projectId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Delete images one by one
      const deletePromises = selectedImageIds.value.map((imageId) => {
        return imageService.deleteImage(projectId, imageId)
      })

      await Promise.all(deletePromises)

      // Update state
      images.value = images.value.filter((image) => !selectedImageIds.value.includes(image.id))
      selectedImage.value = null
      selectedImageIds.value = []
    } catch (err: any) {
      error.value = err.message || 'Failed to delete selected images'
      console.error('Error deleting selected images:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateImageTags(
    projectId: number,
    imageId: number,
    tags: string[],
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Add new tags to availableTags
      tags.forEach((tag) => {
        if (!availableTags.value.includes(tag)) {
          availableTags.value.push(tag)
        }
      })

      // Update on server
      await imageService.updateImageMetadata(projectId, imageId, { tags })

      // Update in local state
      const imageIndex = images.value.findIndex((img) => img.id === imageId)
      if (imageIndex !== -1) {
        const updatedImage = { ...images.value[imageIndex], tags }
        images.value[imageIndex] = updatedImage

        // Update selected image if needed
        if (selectedImage.value?.id === imageId) {
          selectedImage.value = updatedImage
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update image tags'
      console.error('Error updating image tags:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function setSelectedImage(image: Image | null): void {
    selectedImage.value = image
  }

  function toggleImageSelection(id: number): void {
    const index = selectedImageIds.value.indexOf(id)
    if (index !== -1) {
      selectedImageIds.value.splice(index, 1)
    } else {
      selectedImageIds.value.push(id)
    }
  }

  function selectAllImages(): void {
    selectedImageIds.value = images.value.map((img) => img.id)
  }

  function deselectAllImages(): void {
    selectedImageIds.value = []
  }

  function addTag(tag: string): void {
    if (tag && !availableTags.value.includes(tag)) {
      availableTags.value.push(tag)
    }
  }

  function setCurrentBatchName(name: string): void {
    currentBatchName.value = name
  }

  function resetState(): void {
    images.value = []
    selectedImage.value = null
    selectedImageIds.value = []
    loading.value = false
    uploading.value = false
    uploadProgress.value = 0
    error.value = null
  }

  async function fetchImageById(projectId: number, imageId: number): Promise<Image | null> {
    loading.value = true
    error.value = null

    try {
      // First check if the image is already in the store
      const existingImage = images.value.find((img) => img.id === imageId)
      if (existingImage) {
        return existingImage
      }

      // If not, fetch it from the server
      const image = await imageService.getImageById(projectId, imageId)

      // Add it to our local cache if it's not already there
      if (!images.value.some((img) => img.id === image.id)) {
        images.value.push(image)
      }

      return image
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch image'
      console.error(`Error fetching image ${imageId}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    images,
    selectedImage,
    selectedImageIds,
    currentBatchName,
    availableTags,
    loading,
    uploading,
    uploadProgress,
    error,

    // Getters
    imageCount,
    hasSelectedImages,
    isLoading,
    isUploading,

    // Actions
    fetchProjectImages,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteSelectedImages,
    updateImageTags,
    setSelectedImage,
    toggleImageSelection,
    selectAllImages,
    deselectAllImages,
    addTag,
    setCurrentBatchName,
    resetState,
    fetchImageById,
  }
})
