<template>
    <div class="relative cursor-pointer group" @click="$emit('select', imageId)">

        <!-- Image -->
        <img v-if="imageInfo && !error" :src="imageInfo.filePath" :alt="imageInfo.originalFilename"
            class="w-full h-full object-cover" />

        <!-- Loading placeholder -->
        <div v-else-if="loading" class="w-full h-full bg-gray-200 animate-pulse"></div>

        <!-- Error state -->
        <div v-else-if="error" class="w-full h-full bg-red-100 flex items-center justify-center p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>

        <!-- Selection overlay -->
        <div class="absolute inset-0 flex items-center justify-center"
            :class="selected ? 'bg-brand-purple bg-opacity-20' : 'bg-black bg-opacity-0 group-hover:bg-opacity-10'">
            <div v-if="selected" class="bg-white rounded-full p-1">
                <svg class="h-4 w-4 text-brand-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                </svg>
            </div>
        </div>

        <!-- Image info overlay -->
        <div v-if="imageInfo" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 
                  opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
            <p class="truncate">{{ imageInfo.originalFilename || `Image ${imageId}` }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useImageStore } from '@/stores/image';
import { useRoute } from 'vue-router';
import type { Image } from '@/types/image';

const props = defineProps<{
    imageId: number;
    selected: boolean;
}>();

defineEmits(['select']);

// Image store
const imageStore = useImageStore();
const route = useRoute();

// Get project ID from route
const projectId = Number(route.params.projectId);

// Local state
const imageInfo = ref<Image | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Load image info
onMounted(async () => {
    loadImageInfo();
});

// Watch for changes in image ID
watch(() => props.imageId, () => {
    loadImageInfo();
});

// Methods
const loadImageInfo = async () => {
    loading.value = true;
    error.value = null;

    try {
        // Check if image is already in the store
        const existingImage = imageStore.images.find(img => img.id === props.imageId);
        if (existingImage) {
            imageInfo.value = existingImage;
            return;
        }

        // If not, fetch it from the server
        const image = await imageStore.fetchImageById(projectId, props.imageId);
        if (image) {
            imageInfo.value = image;
        } else {
            error.value = 'Failed to load image';
        }
    } catch (err: any) {
        error.value = err.message || 'Failed to load image';
        console.error(`Error loading image ${props.imageId}:`, err);
    } finally {
        loading.value = false;
    }
};
</script>