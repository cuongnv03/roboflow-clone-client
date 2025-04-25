<template>
  <div
    class="image-card group relative rounded-lg overflow-hidden bg-white cursor-pointer border border-gray-200"
    :class="{ 'ring-2 ring-purple-500': isSelected }"
    @click="handleCardClick"
  >
    <!-- Image thumbnail -->
    <div class="aspect-square overflow-hidden relative">
      <img
        :src="image.url"
        :alt="image.name"
        class="w-full h-full object-cover"
      />

      <!-- Checkbox -->
      <div
        class="absolute top-2 left-2 z-10"
        @click.stop="toggleCheckbox"
      >
        <Checkbox :checked="isChecked" />
      </div>

      <!-- Annotated Status -->
      <div
        class="absolute top-2 right-2 p-1 rounded-full"
        :class="image.isAnnotated ? 'bg-green-500' : 'bg-gray-300'"
        @click.stop="toggleAnnotation"
        :title="image.isAnnotated ? 'Annotated' : 'Not Annotated'"
      >
        <Check class="h-4 w-4 text-white" />
      </div>
    </div>

    <!-- Info Panel -->
    <div class="p-2 bg-white">
      <p class="text-sm font-medium truncate" :title="image.name">
        {{ image.name }}
      </p>
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>{{ formattedSize }}</span>
        <span>{{ formattedDate }}</span>
      </div>
      <p class="text-xs text-purple-600 truncate mt-1" :title="image.batchName">
        {{ image.batchName || 'Untitled Batch' }}
      </p>

      <!-- Tags -->
      <div v-if="image.tags.length" class="mt-2 flex flex-wrap gap-1">
        <Badge
          v-for="tag in image.tags.slice(0, 2)"
          :key="tag"
          variant="outline"
          class="text-xs py-0 px-1"
        >
          {{ tag }}
        </Badge>
        <Badge
          v-if="image.tags.length > 2"
          variant="outline"
          class="text-xs py-0 px-1"
        >
          +{{ image.tags.length - 2 }}
        </Badge>
      </div>
    </div>

    <!-- Delete Button (on hover) -->
    <div
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
    >
      <Button
        size="icon"
        variant="destructive"
        class="h-7 w-7"
        @click.stop="deleteImg"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { images } from '@/stores/images'
import { Check, Trash2 } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

interface Props {
  image: {
    id: string
    url: string
    name: string
    size: number
    uploadedAt: Date
    batchName: string
    tags: string[]
    isAnnotated: boolean
  }
}

const props = defineProps<Props>()

const store = images()

const isSelected = computed(() => store.selectedImage?.id === props.image.id)
const isChecked = computed(() => store.selectedImageIds.includes(props.image.id))

const formattedSize = computed(() => {
  const bytes = props.image.size
  return bytes < 1024
    ? bytes + ' B'
    : bytes < 1048576
    ? (bytes / 1024).toFixed(1) + ' KB'
    : (bytes / 1048576).toFixed(1) + ' MB'
})

const formattedDate = computed(() => {
  return new Date(props.image.uploadedAt).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function handleCardClick() {
  store.setSelectedImage(isSelected.value ? null : props.image)
}

function toggleCheckbox() {
  store.toggleImageSelection(props.image.id)
}

function toggleAnnotation() {
  store.toggleAnnotationStatus(props.image.id)
}

function deleteImg() {
  store.deleteImage(props.image.id)
}
</script>
