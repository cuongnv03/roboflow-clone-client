<template>
  <div class="space-y-4">
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4">
      <div class="flex items-center space-x-4">
        <!-- Select/Deselect All -->
        <Button
          size="sm"
          variant="outline"
          :class="{
            'border-purple-500': allSelected,
            'border-purple-300': someSelected,
          }"
          @click="toggleSelectAll"
        >
          <component :is="selectIcon" class="h-4 w-4 mr-2" />
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </Button>

        <!-- Delete Selected -->
        <Button
          v-if="selectedImageIds.length"
          size="sm"
          variant="destructive"
          @click="showDeleteDialog = true"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
      </div>

      <!-- Search Box -->
      <div class="flex items-center space-x-2 flex-1 md:max-w-xs">
        <div class="relative flex-1">
          <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search images..."
            v-model="searchTerm"
            class="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" title="Filter">
          <SlidersHorizontal class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Filter: Annotated / Not -->
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <div class="flex items-center space-x-2">
        <Checkbox v-model:checked="showAnnotatedOnly" />
        <label class="cursor-pointer">Annotated ({{ annotatedCount }})</label>

        <Checkbox v-model:checked="showNotAnnotatedOnly" />
        <label class="cursor-pointer">Not Annotated ({{ notAnnotatedCount }})</label>
      </div>

      <div class="ml-auto">Total: {{ images.length }} images</div>
    </div>

    <!-- Image Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <ImageCard v-for="img in filteredImages" :key="img.id" :image="img" />
    </div>

    <!-- No Images State -->
    <div v-if="!filteredImages.length" class="p-8 text-center text-gray-500">
      No images match your filters.
    </div>

    <!-- Delete Confirm Dialog -->
    <Dialog v-model="showDeleteDialog">
      <div class="text-lg font-semibold mb-2">Confirm Deletion</div>
      <p class="text-gray-600 mb-4">
        Are you sure you want to delete {{ selectedImageIds.length }}
        selected image{{ selectedImageIds.length > 1 ? 's' : '' }}? This action
        cannot be undone.
      </p>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete">
          Delete
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImageStore } from '@/stores/useImageStore'
import ImageCard from '@/components/ImageCard.vue'

import  Button  from '@/components/ui/Button.vue'
import  Input  from '@/components/ui/Input.vue'
import  Checkbox  from '@/components/ui/Checkbox.vue'
import  Dialog  from '@/components/ui/Dialog.vue'

import { Trash2, CheckSquare, Square, Search, SlidersHorizontal } from 'lucide-vue-next'

const imageStore = useImageStore()
const searchTerm = ref('')
const showAnnotatedOnly = ref(false)
const showNotAnnotatedOnly = ref(false)
const showDeleteDialog = ref(false)

const images = computed(() => imageStore.images)
const selectedImageIds = computed(() => imageStore.selectedImageIds)

const annotatedCount = computed(() => images.value.filter(i => i.isAnnotated).length)
const notAnnotatedCount = computed(() => images.value.filter(i => !i.isAnnotated).length)

const filteredImages = computed(() => {
  return images.value.filter((img) => {
    const matchesSearch =
      !searchTerm.value ||
      img.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      img.batchName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm.value.toLowerCase()))

    const matchesFilter =
      (!showAnnotatedOnly.value && !showNotAnnotatedOnly.value) ||
      (showAnnotatedOnly.value && img.isAnnotated) ||
      (showNotAnnotatedOnly.value && !img.isAnnotated)

    return matchesSearch && matchesFilter
  })
})

const allSelected = computed(() => selectedImageIds.value.length === images.value.length && images.value.length > 0)
const someSelected = computed(() => selectedImageIds.value.length > 0 && !allSelected.value)

const selectIcon = computed(() => {
  if (allSelected.value) return CheckSquare
  if (someSelected.value) return {
    template: `<div class="h-4 w-4 mr-2 border-2 border-current flex items-center justify-center"><div class="h-2 w-2 bg-current"></div></div>`
  }
  return Square
})

function toggleSelectAll() {
  if (allSelected.value) {
    imageStore.deselectAllImages()
  } else {
    imageStore.selectAllImages()
  }
}

function confirmDelete() {
  imageStore.deleteSelectedImages()
  showDeleteDialog.value = false
}
</script>
