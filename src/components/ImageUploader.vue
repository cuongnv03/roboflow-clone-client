<template>
  <div class="space-y-4">
    <!-- Batch name & new tag -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label for="batchName">Batch Name</Label>
        <Input
          id="batchName"
          v-model="imageStore.currentBatchName"
          placeholder="Enter a name for this batch"
        />
      </div>
      <div>
        <Label for="newTag">Add Tags</Label>
        <div class="flex mt-1">
          <Input
            id="newTag"
            v-model="newTag"
            @keypress.enter.prevent="addNewTag"
            placeholder="Add a tag"
            class="flex-1"
          />
          <Button class="ml-2" @click="addNewTag">
            <Plus size="16" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Selected Tags -->
    <div v-if="selectedTags.length" class="flex flex-wrap gap-2">
      <Badge
        v-for="tag in selectedTags"
        :key="tag"
        variant="secondary"
        class="flex items-center gap-1"
      >
        {{ tag }}
        <X class="cursor-pointer" size="14" @click="removeTag(tag)" />
      </Badge>
    </div>

    <!-- Available Tags -->
    <div v-if="availableTags.length > selectedTags.length">
      <Label class="block mb-1">Available Tags</Label>
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in availableTags.filter(t => !selectedTags.includes(t))"
          :key="tag"
          variant="outline"
          class="cursor-pointer hover:bg-secondary"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </Badge>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
      class="drop-zone border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <UploadCloud class="w-10 h-10 text-purple-500 mb-2 mx-auto" />
      <p class="text-gray-600 mb-2">Drag & drop images or videos here</p>
      <p class="text-sm text-gray-500 mb-4">
        Supported formats: JPG, PNG, BMP, WEBP, AVIF, MOV, MP4<br />
        Max size: 20MB per file, up to 16,384px per dimension
      </p>
      <div class="flex justify-center gap-2">
        <Button>
          <label class="cursor-pointer">
            Browse Files
            <input
              type="file"
              class="hidden"
              accept="image/jpeg,image/png,image/bmp,image/webp,image/avif,video/mp4,video/quicktime"
              multiple
              @change="onFileSelect"
            />
          </label>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageStore } from '@/stores/useImageStore'

import { UploadCloud, Plus, X } from 'lucide-vue-next'

// ✅ Import default từ .vue files — KHÔNG destructure
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Label from '@/components/ui/Label.vue'

const imageStore = useImageStore()
const isDragging = ref(false)
const selectedTags = ref<string[]>([])
const newTag = ref('')

const availableTags = computed(() => imageStore.availableTags)

const onDragEnter = () => (isDragging.value = true)
const onDragOver = () => (isDragging.value = true)
const onDragLeave = () => (isDragging.value = false)
const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) {
    imageStore.addImages(files, imageStore.currentBatchName, selectedTags.value)
  }
}

const onFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) {
    imageStore.addImages(files, imageStore.currentBatchName, selectedTags.value)
    ;(e.target as HTMLInputElement).value = '' // Reset input
  }
}

const addNewTag = () => {
  const tag = newTag.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    imageStore.addTag(tag)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag)
}

const selectTag = (tag: string) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}
</script>
