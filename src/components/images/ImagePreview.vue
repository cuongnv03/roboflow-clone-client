<template>
  <Dialog v-model="dialogOpen">
    <div class="max-w-4xl w-full">
      <!-- Header -->
      <div class="text-xl font-semibold mb-4">
        {{ selectedImage?.name }}
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <!-- Image -->
        <div class="flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          <img
            :src="selectedImage?.url"
            :alt="selectedImage?.name"
            class="max-h-[60vh] object-contain"
          />
        </div>

        <!-- Info Panel -->
        <div class="w-full md:w-64 space-y-4">
          <!-- Details -->
          <div class="space-y-2 text-sm">
            <h3 class="font-medium">Image Details</h3>
            <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
              <span class="text-gray-500">Name:</span>
              <span class="truncate" :title="selectedImage?.name">{{ selectedImage?.name }}</span>

              <span class="text-gray-500">Type:</span>
              <span>{{ imageType }}</span>

              <span class="text-gray-500">Size:</span>
              <span>{{ imageSize }}</span>

              <span class="text-gray-500">Uploaded:</span>
              <span>{{ uploadedAt }}</span>

              <span class="text-gray-500">Batch:</span>
              <span>{{ selectedImage?.batchName || 'Untitled' }}</span>

              <span class="text-gray-500">Status:</span>
              <Button
                variant="ghost"
                size="sm"
                class="px-2 py-1 h-auto text-xs"
                :class="selectedImage?.isAnnotated ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-600'"
                @click="toggleAnnotation"
              >
                <Check class="h-4 w-4 mr-1" :class="selectedImage?.isAnnotated ? 'text-green-600' : 'text-gray-400'" />
                {{ selectedImage?.isAnnotated ? 'Annotated' : 'Not Annotated' }}
              </Button>
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-2">
            <h3 class="font-medium">Tags</h3>
            <div class="flex">
              <Input
                placeholder="Add a tag"
                v-model="newTag"
                @keypress.enter.prevent="addTag"
                class="flex-1"
              />
              <Button size="sm" class="ml-2" @click="addTag">
                <Plus size="16" />
              </Button>
            </div>

            <!-- Selected tags -->
            <div v-if="selectedImage?.tags?.length" class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in selectedImage.tags"
                :key="tag"
                variant="secondary"
                class="flex items-center gap-1"
              >
                {{ tag }}
                <X size="14" class="cursor-pointer" @click="removeTag(tag)" />
              </Badge>
            </div>
            <p v-else class="text-sm text-gray-500">No tags added yet</p>

            <!-- Available tags -->
            <div v-if="availableTagsToShow.length">
              <p class="text-xs text-gray-500 mt-2">Available tags:</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <Badge
                  v-for="tag in availableTagsToShow"
                  :key="tag"
                  variant="outline"
                  class="cursor-pointer hover:bg-secondary"
                  @click="selectTag(tag)"
                >
                  {{ tag }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="close">Close</Button>
        <Button variant="destructive" @click="deleteImg">
          <Trash2 class="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { images } from '@/stores/images'
import { Check, Plus, Trash2, X } from 'lucide-vue-next'

import  Dialog  from '@/components/ui/Dialog.vue'
import  Button  from '@/components/ui/Button.vue'
import  Input  from '@/components/ui/Input.vue'
import  Badge  from '@/components/ui/Badge.vue'

const imageStore = images()
const newTag = ref('')
const selectedImage = computed(() => imageStore.selectedImage)

const dialogOpen = computed({
  get: () => !!selectedImage.value,
  set: (val: boolean) => {
    if (!val) imageStore.setSelectedImage(null)
  },
})

const imageSize = computed(() =>
  selectedImage.value ? (selectedImage.value.size / 1024).toFixed(1) + ' KB' : ''
)
const imageType = computed(() =>
  selectedImage.value ? selectedImage.value.type.replace('image/', '') : ''
)
const uploadedAt = computed(() =>
  selectedImage.value
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(selectedImage.value.uploadedAt)
    : ''
)

const close = () => {
  imageStore.setSelectedImage(null)
}

const deleteImg = () => {
  if (selectedImage.value) {
    imageStore.deleteImage(selectedImage.value.id)
    close()
  }
}

const toggleAnnotation = () => {
  if (selectedImage.value) {
    imageStore.toggleAnnotationStatus(selectedImage.value.id)
  }
}

const addTag = () => {
  if (!selectedImage.value || !newTag.value.trim()) return
  const tag = newTag.value.trim()
  if (!selectedImage.value.tags.includes(tag)) {
    const newTags = [...selectedImage.value.tags, tag]
    imageStore.updateImageTags(selectedImage.value.id, newTags)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  if (!selectedImage.value) return
  const newTags = selectedImage.value.tags.filter(t => t !== tag)
  imageStore.updateImageTags(selectedImage.value.id, newTags)
}

const selectTag = (tag: string) => {
  if (!selectedImage.value || selectedImage.value.tags.includes(tag)) return
  const updated = [...selectedImage.value.tags, tag]
  imageStore.updateImageTags(selectedImage.value.id, updated)
}

const availableTagsToShow = computed(() =>
  imageStore.availableTags.filter(
    tag => !selectedImage.value?.tags.includes(tag)
  )
)
</script>
