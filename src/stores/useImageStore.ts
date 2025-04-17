import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ImageFile {
  id: string
  file: File
  url: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  tags: string[]
  isAnnotated: boolean
  batchName: string
}

export const useImageStore = defineStore('image', () => {
  const images = ref<ImageFile[]>([])
  const selectedImage = ref<ImageFile | null>(null)
  const selectedImageIds = ref<string[]>([])
  const currentBatchName = ref('')
  const availableTags = ref<string[]>([])

  const addImages = async (
    files: FileList | File[],
    batch = currentBatchName.value,
    tags: string[] = [],
  ) => {
    const fileArray = Array.from(files)
    const newImages: ImageFile[] = []
    const maxSize = 20 * 1024 * 1024
    const maxDimension = 16384

    const checkDimensions = (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
          resolve(true)
          return
        }
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          resolve(img.width <= maxDimension && img.height <= maxDimension)
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          resolve(false)
        }
        img.src = URL.createObjectURL(file)
      })
    }

    for (const file of fileArray) {
      const acceptedTypes = [
        'image/jpeg',
        'image/png',
        'image/bmp',
        'image/webp',
        'image/avif',
        'video/mp4',
        'video/quicktime',
      ]
      if (!acceptedTypes.includes(file.type)) {
        console.error(`${file.name} has unsupported file type`)
        continue
      }
      if (file.size > maxSize) {
        console.error(`${file.name} exceeds size limit`)
        continue
      }

      const validDimensions = await checkDimensions(file)
      if (!validDimensions) {
        console.error(`${file.name} has invalid dimensions`)
        continue
      }

      const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const url = URL.createObjectURL(file)
      const newTags = [...tags]
      newTags.forEach((tag) => {
        if (!availableTags.value.includes(tag)) {
          availableTags.value.push(tag)
        }
      })

      newImages.push({
        id,
        file,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        tags: newTags,
        isAnnotated: false,
        batchName: batch || 'Untitled Batch',
      })
    }

    if (newImages.length > 0) {
      images.value.push(...newImages)
    }
  }

  const deleteImage = (id: string) => {
    const img = images.value.find((i) => i.id === id)
    if (img) {
      URL.revokeObjectURL(img.url)
      if (selectedImage.value?.id === id) selectedImage.value = null
      selectedImageIds.value = selectedImageIds.value.filter((i) => i !== id)
    }
    images.value = images.value.filter((i) => i.id !== id)
  }

  const deleteSelectedImages = () => {
    selectedImageIds.value.forEach((id) => {
      const img = images.value.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
    })
    images.value = images.value.filter((img) => !selectedImageIds.value.includes(img.id))
    selectedImageIds.value = []
    if (selectedImageIds.value.includes(selectedImage.value?.id || '')) {
      selectedImage.value = null
    }
  }

  const toggleImageSelection = (id: string) => {
    const idx = selectedImageIds.value.indexOf(id)
    if (idx > -1) {
      selectedImageIds.value.splice(idx, 1)
    } else {
      selectedImageIds.value.push(id)
    }
  }

  const selectAllImages = () => {
    selectedImageIds.value = images.value.map((img) => img.id)
  }

  const deselectAllImages = () => {
    selectedImageIds.value = []
  }

  const updateImageTags = (id: string, tags: string[]) => {
    tags.forEach((tag) => {
      if (!availableTags.value.includes(tag)) {
        availableTags.value.push(tag)
      }
    })
    const img = images.value.find((i) => i.id === id)
    if (img) img.tags = tags
  }

  const toggleAnnotationStatus = (id: string) => {
    const img = images.value.find((i) => i.id === id)
    if (img) img.isAnnotated = !img.isAnnotated
  }

  const addTag = (tag: string) => {
    if (!availableTags.value.includes(tag)) {
      availableTags.value.push(tag)
    }
  }

  return {
    images,
    addImages,
    deleteImage,
    deleteSelectedImages,
    selectedImage,
    setSelectedImage: (img: ImageFile | null) => (selectedImage.value = img),
    selectedImageIds,
    toggleImageSelection,
    selectAllImages,
    deselectAllImages,
    updateImageTags,
    toggleAnnotationStatus,
    currentBatchName,
    setCurrentBatchName: (name: string) => (currentBatchName.value = name),
    availableTags,
    addTag,
  }
})
