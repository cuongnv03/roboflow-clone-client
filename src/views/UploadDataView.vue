<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Upload Data</h1>
      <p class="text-gray-600 mt-1">Add images to your project for annotation and training</p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button class="px-6 py-4 text-sm font-medium border-b-2 border-brand-purple text-brand-purple"
            aria-current="page">
            Images
          </button>
          <button
            class="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
            disabled>
            Video (Coming Soon)
          </button>
        </nav>
      </div>

      <!-- Upload Section -->
      <div class="p-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Upload Images</h2>
          <p class="text-sm text-gray-600 mt-1">
            Upload images to your project. Supported formats: JPG, PNG, WEBP, BMP, AVIF
          </p>
        </div>

        <ImageUploader @upload-complete="refreshImages" />
      </div>

      <!-- Gallery Section -->
      <div class="border-t border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Project Images</h2>

          <div class="flex space-x-2">
            <button v-if="uploadStore.hasSelectedImages" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Add Tags
            </button>
            <button :disabled="!uploadStore.images.length" class="btn btn-primary" @click="goToAnnotation">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              Continue to Annotation
            </button>
          </div>
        </div>

        <ImageGallery />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useUploadStore } from '@/stores/upload';
import { useProjectStore } from '@/stores/project';
import ImageUploader from '@/components/upload/ImageUploader.vue';
import ImageGallery from '@/components/upload/ImageGallery.vue';

// Router and route
const router = useRouter();
const route = useRoute();

// Stores
const uploadStore = useUploadStore();
const projectStore = useProjectStore();

// Get project ID from route
const projectId = computed(() => route.params.projectId as string);

// Lifecycle hooks
onMounted(async () => {
  if (projectId.value) {
    await projectStore.fetchProjectById(Number(projectId.value));
    // TODO: Fetch project images when API is ready
    // await fetchProjectImages();
  }
});

// Methods
const refreshImages = () => {
  // TODO: Implement image refresh from server when API is ready
  // For now, the upload store manages this locally
};

const goToAnnotation = () => {
  router.push({
    name: 'project-annotate',
    params: { projectId: projectId.value }
  });
};

// Helper function to get computed projectId
function computed<T>(fn: () => T): { value: T } {
  return { value: fn() };
}
</script>