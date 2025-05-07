<template>
    <div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Upload Data</h1>
            <p class="text-gray-600 mt-1">Add images to your project for annotation and training</p>
        </div>

        <Card>
            <!-- Upload Section -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Upload Images</h2>
                <ImageUploader @upload-complete="refreshImages" />
            </div>

            <!-- Gallery Section -->
            <div class="border-t border-gray-200 pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">Project Images</h2>

                    <div class="flex space-x-2">
                        <Button v-if="imageStore.hasSelectedImages" variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Add Tags
                        </Button>
                        <Button :disabled="!imageStore.images.length" variant="primary" @click="goToAnnotation">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                            Continue to Annotation
                        </Button>
                    </div>
                </div>

                <ImageGallery />
            </div>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useImageStore } from '@/stores/image';
import ProjectLayout from '@/layouts/ProjectLayout.vue';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import ImageUploader from '@/components/upload/ImageUploader.vue';
import ImageGallery from '@/components/upload/ImageGallery.vue';

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
const refreshImages = () => {
    if (projectId.value) {
        imageStore.fetchProjectImages(Number(projectId.value));
    }
};

const goToAnnotation = () => {
    router.push({
        name: 'project-annotate',
        params: { projectId: projectId.value }
    });
};

// Helper function for reactive computed properties
function computed<T>(fn: () => T): { value: T } {
    return { value: fn() };
}
</script>