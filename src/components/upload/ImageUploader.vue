<template>
    <div class="space-y-6">
        <!-- Batch naming and tag options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="batchName" class="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input id="batchName" v-model="batchName" type="text"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    placeholder="Enter a name for this batch" />
                <p class="mt-1 text-xs text-gray-500">Group your uploads for easier organization</p>
            </div>

            <div>
                <label for="newTag" class="block text-sm font-medium text-gray-700 mb-1">Add Tags</label>
                <div class="flex">
                    <input id="newTag" v-model="newTag" type="text"
                        class="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="Add a tag" @keypress.enter.prevent="addTag" />
                    <button type="button" @click="addTag"
                        class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Selected Tags -->
        <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2">
            <span v-for="tag in selectedTags" :key="tag"
                class="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                {{ tag }}
                <button type="button" @click="removeTag(tag)"
                    class="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 bg-gray-200 hover:bg-gray-300 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </span>
        </div>

        <!-- Drag & Drop Zone -->
        <div class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            :class="isDragging ? 'border-brand-purple bg-purple-50' : 'border-gray-300 hover:border-gray-400'"
            @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>

            <h3 class="text-lg font-medium text-gray-900 mb-1">Drag and drop files here</h3>
            <p class="text-sm text-gray-500 mb-4">
                Supported formats: JPG, PNG, WEBP, BMP, AVIF<br>
                Maximum file size: 20MB
            </p>

            <div class="flex justify-center">
                <label class="btn btn-primary cursor-pointer">
                    Browse Files
                    <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp,image/bmp,image/avif"
                        multiple @change="onFileSelect" />
                </label>
            </div>
        </div>

        <!-- Temporary images preview -->
        <div v-if="tempImages.length > 0" class="mt-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Selected Images</h3>
                <div class="flex space-x-2">
                    <button @click="clearTempImages" class="btn btn-outline text-sm py-1.5 px-3">
                        Clear All
                    </button>
                    <button @click="uploadAllImages" :disabled="isUploading"
                        class="btn btn-primary text-sm py-1.5 px-3">
                        <svg v-if="isUploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ isUploading ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>

            <!-- Grid of temporary images -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div v-for="image in tempImages" :key="image.id"
                    class="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <!-- Image preview -->
                    <div class="aspect-square bg-gray-100">
                        <img :src="image.previewUrl" :alt="image.name" class="w-full h-full object-cover" />
                    </div>

                    <!-- Image info -->
                    <div class="p-2 text-sm">
                        <p class="truncate font-medium" :title="image.name">{{ image.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(image.size) }}</p>
                    </div>

                    <!-- Remove button -->
                    <button @click="removeTempImage(image.id)"
                        class="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-purple" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span class="font-medium">Uploading {{ tempImages.length }} files...</span>
                </div>
                <span class="text-sm font-medium text-brand-purple">{{ Math.round(uploadProgress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-brand-purple h-2 rounded-full" :style="`width: ${uploadProgress}%`"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useImageStore } from '@/stores/image';
import { v4 as uuidv4 } from 'uuid';
import type { TempImage } from '@/types/image';

const route = useRoute();
const imageStore = useImageStore();

// Local state
const isDragging = ref(false);
const newTag = ref('');
const selectedTags = ref<string[]>([]);
const batchName = ref('Batch ' + new Date().toLocaleDateString());
const tempImages = ref<TempImage[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Get project ID from route
const projectId = computed(() => Number(route.params.projectId));

// Methods
const onDragEnter = () => { isDragging.value = true; };
const onDragOver = () => { isDragging.value = true; };
const onDragLeave = () => { isDragging.value = false; };

const onDrop = (e: DragEvent) => {
    isDragging.value = false;
    const files = e.dataTransfer?.files;
    if (files?.length) {
        addTempImages(Array.from(files));
    }
};

const onFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
        addTempImages(Array.from(input.files));
        input.value = ''; // Reset input
    }
};

const addTempImages = (files: File[]) => {
    // Filter valid files
    const validFiles = files.filter(file => {
        const maxSize = 20 * 1024 * 1024; // 20MB
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/bmp',
            'image/avif'
        ];

        if (!validTypes.includes(file.type)) {
            console.warn(`File ${file.name} has unsupported type: ${file.type}`);
            return false;
        }

        if (file.size > maxSize) {
            console.warn(`File ${file.name} exceeds size limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
            return false;
        }

        return true;
    });

    if (validFiles.length === 0) {
        alert('No valid files selected. Please check file types and sizes.');
        return;
    }

    // Create temp images with preview URLs
    validFiles.forEach(file => {
        const id = uuidv4();
        const previewUrl = URL.createObjectURL(file);

        tempImages.value.push({
            id,
            file,
            previewUrl,
            name: file.name,
            size: file.size,
            type: file.type
        });
    });
};

const removeTempImage = (id: string) => {
    const image = tempImages.value.find(img => img.id === id);
    if (image && image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl); // Free up memory
    }
    tempImages.value = tempImages.value.filter(img => img.id !== id);
};

const clearTempImages = () => {
    // Revoke all object URLs to prevent memory leaks
    tempImages.value.forEach(img => {
        if (img.previewUrl) {
            URL.revokeObjectURL(img.previewUrl);
        }
    });
    tempImages.value = [];
};

const uploadAllImages = async () => {
    if (tempImages.value.length === 0) return;

    isUploading.value = true;
    uploadProgress.value = 0;

    try {
        // Extract files from temp images
        const files = tempImages.value.map(img => img.file);

        // Upload to server
        await imageStore.uploadMultipleImages(
            files,
            projectId.value,
            {
                batchName: batchName.value,
                tags: selectedTags.value
            },
            (progress) => {
                uploadProgress.value = progress;
            }
        );

        // Clear temp images after successful upload
        clearTempImages();

        // Emit success event
        emit('upload-complete');
    } catch (error) {
        console.error('Failed to upload images:', error);
        alert('Failed to upload images. Please try again.');
    } finally {
        isUploading.value = false;
        uploadProgress.value = 0;
    }
};

const addTag = () => {
    const trimmedTag = newTag.value.trim();
    if (trimmedTag && !selectedTags.value.includes(trimmedTag)) {
        selectedTags.value.push(trimmedTag);
        newTag.value = '';
    }
};

const removeTag = (tag: string) => {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
};

// Format helpers
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
};

// Initialize batch name from store
batchName.value = imageStore.currentBatchName;

// Emits
const emit = defineEmits(['upload-complete']);

// When component is unmounted, clean up object URLs
onUnmounted(() => {
    clearTempImages();
});
</script>