<template>
    <div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Annotate Images</h1>
            <p class="text-gray-600 mt-1">Create annotations for your project images</p>
        </div>

        <div v-if="!imageStore.images.length && !imageStore.isLoading"
            class="text-center py-16 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 class="text-xl font-semibold text-gray-700 mb-2">No Images Available</h2>
            <p class="text-gray-500 mb-6">Upload images first to start annotating</p>
            <Button variant="primary" @click="goToUpload">
                Go to Upload Page
            </Button>
        </div>

        <div v-else-if="imageStore.isLoading" class="flex justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <div v-else class="bg-white rounded-lg shadow">
            <p class="p-8 text-center text-gray-500">
                Annotation tool will be implemented in the next phase.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useImageStore } from '@/stores/image';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import Button from '@/components/common/Button.vue';

// Router and route
const router = useRouter();
const route = useRoute();

// Stores
const imageStore = useImageStore();

// Get project ID from route
const projectId = computed(() => route.params.projectId);

// Lifecycle hooks
onMounted(async () => {
    if (projectId.value) {
        await imageStore.fetchProjectImages(Number(projectId.value));
    }
});

// Methods
const goToUpload = () => {
    router.push({
        name: 'project-upload',
        params: { projectId: projectId.value }
    });
};

// Helper function for reactive computed properties
function computed<T>(fn: () => T): { value: T } {
    return { value: fn() };
}
</script>