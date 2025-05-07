import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ImageFile } from '@/types/image'
import { v4 as uuidv4 } from 'uuid'

export const useUploadStore = defineStore('upload', () => {
  // State
  const images = ref<ImageFile[]>([])
  const selectedImage = ref<ImageFile | null>(null)
  const selectedImageIds = ref<string[]>([])
  const currentBatchName = ref<string>('Batch ' + new Date().toLocaleDateString())
  const availableTags = ref<string[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)

  // Getters
  const imageCount = computed(() => images.value.length)
  const hasSelectedImages = computed(() => selectedImageIds.value.length > 0)

  // Actions
  function setSelectedImage(image: ImageFile | null) {
    selectedImage.value = image
  }

  function toggleImageSelection(id: string) {
    const index = selectedImageIds.value.indexOf(id)
    if (index !== -1) {
      selectedImageIds.value.splice(index, 1)
    } else {
      selectedImageIds.value.push(id)
    }
  }

  function selectAllImages() {
    selectedImageIds.value = images.value.map((img) => img.id)
  }

  function deselectAllImages() {
    selectedImageIds.value = []
  }

  function addFilesToQueue(files: File[], batchName = currentBatchName.value, tags: string[] = []) {
    // Filter valid files
    const validFiles = files.filter((file) => {
      const maxSize = 20 * 1024 * 1024 // 20MB
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/avif']

      if (!validTypes.includes(file.type)) {
        console.warn(`File ${file.name} has unsupported type: ${file.type}`)
        return false
      }

      if (file.size > maxSize) {
        console.warn(
          `File ${file.name} exceeds size limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        )
        return false
      }

      return true
    })

    if (validFiles.length === 0) {
      uploadError.value = 'No valid files to upload'
      return
    }

    // Update tags registry
    tags.forEach((tag) => {
      if (!availableTags.value.includes(tag)) {
        availableTags.value.push(tag)
      }
    })

    // Add images with temporary URLs
    validFiles.forEach((file) => {
      const id = uuidv4()
      const url = URL.createObjectURL(file)

      images.value.push({
        id,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        tags: [...tags],
        isAnnotated: false,
        batchName: batchName || 'Untitled Batch',
        isUploading: true,
      })
    })

    // Simulate server upload
    simulateUpload(validFiles)
  }

  async function simulateUpload(files: File[]) {
    isUploading.value = true
    uploadProgress.value = 0

    const totalFiles = files.length
    let uploadedFiles = 0

    for (const file of files) {
      // Find the corresponding image
      const imgIndex = images.value.findIndex((img) => img.name === file.name && img.isUploading)

      if (imgIndex === -1) continue

      // Simulate API calls with delays
      await new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 10
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)

            // Mark image as uploaded
            if (imgIndex !== -1) {
              images.value[imgIndex].isUploading = false
            }

            uploadedFiles++
            uploadProgress.value = (uploadedFiles / totalFiles) * 100
            resolve()
          }
        }, 200)
      })
    }

    isUploading.value = false
    uploadProgress.value = 0
  }

  function toggleAnnotationStatus(id: string) {
    const img = images.value.find((i) => i.id === id)
    if (img) {
      img.isAnnotated = !img.isAnnotated
    }
  }

  function updateImageTags(id: string, tags: string[]) {
    // Add new tags to available tags
    tags.forEach((tag) => {
      if (!availableTags.value.includes(tag)) {
        availableTags.value.push(tag)
      }
    })

    // Update image tags
    const img = images.value.find((i) => i.id === id)
    if (img) {
      img.tags = tags
    }
  }

  function addTag(tag: string) {
    if (tag && !availableTags.value.includes(tag)) {
      availableTags.value.push(tag)
    }
  }

  function deleteImage(id: string) {
    const img = images.value.find((i) => i.id === id)
    if (!img) return

    // Revoke object URL to prevent memory leaks
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url)
    }

    // Remove from selections
    if (selectedImage.value?.id === id) {
      selectedImage.value = null
    }
    selectedImageIds.value = selectedImageIds.value.filter((imgId) => imgId !== id)

    // Remove from images array
    images.value = images.value.filter((i) => i.id !== id)
  }

  function deleteSelectedImages() {
    // Create a copy to avoid issues during iteration
    const idsToDelete = [...selectedImageIds.value]
    idsToDelete.forEach((id) => deleteImage(id))
    selectedImageIds.value = []
  }

  function setCurrentBatchName(name: string) {
    currentBatchName.value = name
  }

  return {
    // State
    images,
    selectedImage,
    selectedImageIds,
    currentBatchName,
    availableTags,
    isUploading,
    uploadProgress,
    uploadError,

    // Getters
    imageCount,
    hasSelectedImages,

    // Actions
    setSelectedImage,
    toggleImageSelection,
    selectAllImages,
    deselectAllImages,
    addFilesToQueue,
    toggleAnnotationStatus,
    updateImageTags,
    addTag,
    deleteImage,
    deleteSelectedImages,
    setCurrentBatchName,
  }
})
