<template>
    <div class="space-y-4">
        <!-- Gallery Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center space-x-3 self-start">
                <button @click="toggleSelectAll" class="flex items-center px-3 py-1.5 text-sm rounded-md border"
                    :class="allSelected ? 'bg-purple-50 border-brand-purple text-brand-purple' : 'border-gray-300 bg-white text-gray-700'">
                    <svg v-if="allSelected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="someSelected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                    {{ allSelected ? 'Deselect All' : 'Select All' }}
                </button>

                <button v-if="selectedCount > 0" @click="confirmDeleteSelected"
                    class="flex items-center px-3 py-1.5 text-sm rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({{ selectedCount }})
                </button>
            </div>

            <div class="flex items-center space-x-2 w-full sm:w-auto max-w-md">
                <div class="relative flex-1">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" v-model="searchQuery" placeholder="Search images..."
                        class="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                </div>

                <button
                    class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center space-x-4 text-sm">
            <div class="flex items-center space-x-1">
                <input type="checkbox" id="annotated-filter" v-model="showAnnotatedOnly"
                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                <label for="annotated-filter" class="text-gray-700">Annotated ({{ annotatedCount }})</label>
            </div>

            <div class="flex items-center space-x-1">
                <input type="checkbox" id="not-annotated-filter" v-model="showNotAnnotatedOnly"
                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                <label for="not-annotated-filter" class="text-gray-700">Not Annotated ({{ notAnnotatedCount }})</label>
            </div>

            <div class="ml-auto text-gray-500">
                {{ filteredImages.length }} of {{ imageStore.images.length }} images
            </div>
        </div>

        <!-- Image Grid -->
        <div v-if="filteredImages.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="image in filteredImages" :key="image.id"
                class="relative overflow-hidden rounded-lg border border-gray-200 bg-white group"
                :class="{ 'ring-2 ring-brand-purple': isImageSelected(image.id) }">
                <!-- Checkbox overlay -->
                <div class="absolute top-2 left-2 z-10 cursor-pointer" @click.stop="toggleImageSelection(image.id)">
                    <div class="h-5 w-5 flex items-center justify-center rounded border"
                        :class="isImageSelected(image.id) ? 'bg-brand-purple border-brand-purple' : 'bg-white border-gray-300'">
                        <svg v-if="isImageSelected(image.id)" xmlns="http://www.w3.org/2000/svg"
                            class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>

                <!-- Annotation status -->
                <div class="absolute top-2 right-2 z-10 cursor-pointer h-5 w-5 rounded-full flex items-center justify-center"
                    :class="image.status === 'annotated' ? 'bg-green-500' : 'bg-gray-300'"
                    @click.stop="toggleAnnotationStatus(image)"
                    :title="image.status === 'annotated' ? 'Annotated' : 'Not Annotated'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </div>

                <!-- Image thumbnail -->
                <div class="aspect-square relative bg-gray-100 cursor-pointer" @click="openImagePreview(image)">
                    <img :src="image.filePath" :alt="image.originalFilename" class="w-full h-full object-cover"
                        loading="lazy" />
                </div>

                <!-- Image info -->
                <div class="p-2 text-sm">
                    <p class="truncate font-medium" :title="image.originalFilename">{{ image.originalFilename }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ formatDate(image.uploadDate) }}</p>
                </div>

                <!-- Delete button overlay -->
                <button @click.stop="confirmDeleteImage(image.id)"
                    class="absolute top-2 right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title="Delete image">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="imageStore.images.length === 0 && !imageStore.isLoading"
            class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 mb-4">No images uploaded yet</p>
            <p class="text-sm text-gray-500">Upload images using the uploader above</p>
        </div>

        <!-- Loading state -->
        <div v-else-if="imageStore.isLoading" class="flex justify-center py-10">
            <svg class="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <!-- No results -->
        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-gray-500">No images match your search or filters</p>
        </div>

        <!-- Image Preview Modal -->
        <Modal v-model="showPreview" size="lg">
            <template #header>
                <h3 class="text-lg font-medium text-gray-900 truncate" :title="previewImage?.originalFilename">
                    {{ previewImage?.originalFilename }}
                </h3>
            </template>

            <div v-if="previewImage" class="flex flex-col md:flex-row gap-6">
                <!-- Image -->
                <div class="md:w-2/3 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                    <img :src="previewImage.filePath" :alt="previewImage.originalFilename"
                        class="max-h-[60vh] object-contain" />
                </div>

                <!-- Image info -->
                <div class="md:w-1/3 space-y-4">
                    <div>
                        <h4 class="font-medium text-gray-900 mb-2">Image Details</h4>
                        <div class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
                            <span class="text-gray-500">Dimensions:</span>
                            <span>{{ previewImage.width }}×{{ previewImage.height }}</span>

                            <span class="text-gray-500">Uploaded:</span>
                            <span>{{ formatDate(previewImage.uploadDate) }}</span>

                            <span class="text-gray-500">Batch:</span>
                            <span>{{ previewImage.batchName || 'Untitled' }}</span>

                            <span class="text-gray-500">Status:</span>
                            <button @click="toggleAnnotationStatus(previewImage)"
                                class="flex items-center text-sm text-left"
                                :class="previewImage.status === 'annotated' ? 'text-green-600' : 'text-gray-500'">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"
                                    :class="previewImage.status === 'annotated' ? 'text-green-600' : 'text-gray-400'"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                {{ previewImage.status === 'annotated' ? 'Annotated' : 'Not Annotated' }}
                            </button>
                        </div>
                    </div>

                    <!-- Tags -->
                    <div>
                        <h4 class="font-medium text-gray-900 mb-2">Tags</h4>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="tag in previewImage.tags" :key="tag"
                                class="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                                {{ tag }}
                                <button type="button" @click="removeTagFromImage(previewImage.id, tag)"
                                    class="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 bg-gray-200 hover:bg-gray-300 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </span>
                        </div>

                        <!-- Add new tag -->
                        <div class="flex mt-2">
                            <input type="text" v-model="newImageTag"
                                class="flex-1 rounded-l-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                placeholder="Add a tag" @keypress.enter.prevent="addTagToImage" />
                            <button type="button" @click="addTagToImage"
                                class="inline-flex items-center px-3 py-1.5 text-sm border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between">
                    <button @click="confirmDeleteImage(previewImage?.id || 0)"
                        class="btn btn-outline text-red-600 border-red-300 hover:bg-red-50">
                        Delete
                    </button>

                    <div class="flex space-x-2">
                        <button @click="navigateImage(-1)" class="btn btn-outline" :disabled="!hasPreviousImage">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button @click="navigateImage(1)" class="btn btn-outline" :disabled="!hasNextImage">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button @click="showPreview = false" class="btn btn-primary">
                            Close
                        </button>
                    </div>
                </div>
            </template>
        </Modal>

        <!-- Delete Confirmation Modal -->
        <Modal v-model="showDeleteConfirm" title="Confirm Deletion">
            <p class="text-gray-600 mb-4">
                Are you sure you want to delete
                {{ deleteTarget === 'selected' ? `${selectedCount} selected` : 'this' }} image(s)?
                This action cannot be undone.
            </p>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <button @click="showDeleteConfirm = false" class="btn btn-outline">
                        Cancel
                    </button>
                    <button @click="executeDelete" class="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                        :disabled="imageStore.isLoading">
                        <span v-if="imageStore.isLoading">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Deleting...
                        </span>
                        <span v-else>Delete</span>
                    </button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useImageStore } from '@/stores/image';
import type { Image } from '@/types/image';
import Modal from '@/components/common/Modal.vue';

// Route and store
const route = useRoute();
const imageStore = useImageStore();

// Project ID from route
const projectId = computed(() => Number(route.params.projectId));

// Local state
const searchQuery = ref('');
const showAnnotatedOnly = ref(false);
const showNotAnnotatedOnly = ref(false);
const showPreview = ref(false);
const previewImage = ref<Image | null>(null);
const newImageTag = ref('');
const showDeleteConfirm = ref(false);
const deleteTarget = ref<'single' | 'selected'>('single');
const imageToDelete = ref(0);

// Fetch images on component mount
onMounted(() => {
    if (projectId.value) {
        imageStore.fetchProjectImages(projectId.value);
    }
});

// Computed properties
const filteredImages = computed(() => {
    return imageStore.images.filter(img => {
        // Text search
        const matchesSearch = !searchQuery.value ||
            img.originalFilename.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (img.batchName && img.batchName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
            img.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()));

        // Annotation filters
        const matchesAnnotation =
            (!showAnnotatedOnly.value && !showNotAnnotatedOnly.value) ||
            (showAnnotatedOnly.value && img.status === 'annotated') ||
            (showNotAnnotatedOnly.value && img.status !== 'annotated');

        return matchesSearch && matchesAnnotation;
    });
});

const annotatedCount = computed(() =>
    imageStore.images.filter(img => img.status === 'annotated').length
);

const notAnnotatedCount = computed(() =>
    imageStore.images.filter(img => img.status !== 'annotated').length
);

const selectedCount = computed(() =>
    imageStore.selectedImageIds.length
);

const allSelected = computed(() =>
    imageStore.selectedImageIds.length === imageStore.images.length &&
    imageStore.images.length > 0
);

const someSelected = computed(() =>
    imageStore.selectedImageIds.length > 0 &&
    !allSelected.value
);

// For navigation in preview modal
const currentImageIndex = computed(() => {
    if (!previewImage.value) return -1;
    return filteredImages.value.findIndex(img => img.id === previewImage.value?.id);
});

const hasNextImage = computed(() => {
    return currentImageIndex.value < filteredImages.value.length - 1;
});

const hasPreviousImage = computed(() => {
    return currentImageIndex.value > 0;
});

// Methods
const toggleSelectAll = () => {
    if (allSelected.value) {
        imageStore.deselectAllImages();
    } else {
        imageStore.selectAllImages();
    }
};

const isImageSelected = (id: number) => {
    return imageStore.selectedImageIds.includes(id);
};

const toggleImageSelection = (id: number) => {
    imageStore.toggleImageSelection(id);
};

const toggleAnnotationStatus = async (image: Image) => {
    try {
        // Call API to update status
        const newStatus = image.status === 'annotated' ? 'uploaded' : 'annotated';
        await imageService.updateImageMetadata(projectId.value, image.id, { status: newStatus });

        // Update image in local state
        const imageIndex = imageStore.images.findIndex(img => img.id === image.id);
        if (imageIndex !== -1) {
            imageStore.images[imageIndex] = { ...image, status: newStatus };

            // Update preview image if needed
            if (previewImage.value?.id === image.id) {
                previewImage.value = { ...previewImage.value, status: newStatus };
            }
        }
    } catch (error) {
        console.error('Failed to update image status:', error);
        // Show error notification
    }
};

const openImagePreview = (image: Image) => {
    previewImage.value = image;
    showPreview.value = true;
};

const navigateImage = (direction: number) => {
    const newIndex = currentImageIndex.value + direction;
    if (newIndex >= 0 && newIndex < filteredImages.value.length) {
        previewImage.value = filteredImages.value[newIndex];
    }
};

const addTagToImage = async () => {
    if (previewImage.value && newImageTag.value.trim()) {
        const tag = newImageTag.value.trim();
        const currentTags = [...previewImage.value.tags];

        if (!currentTags.includes(tag)) {
            const newTags = [...currentTags, tag];

            try {
                // Update tags on server
                await imageStore.updateImageTags(projectId.value, previewImage.value.id, newTags);

                // Add to available tags
                imageStore.addTag(tag);

                // Reset input
                newImageTag.value = '';
            } catch (error) {
                console.error('Failed to add tag:', error);
                // Show error notification
            }
        }
    }
};

const removeTagFromImage = async (imageId: number, tagToRemove: string) => {
    const image = imageStore.images.find(img => img.id === imageId);
    if (image) {
        const newTags = image.tags.filter(t => t !== tagToRemove);

        try {
            // Update tags on server
            await imageStore.updateImageTags(projectId.value, imageId, newTags);
        } catch (error) {
            console.error('Failed to remove tag:', error);
            // Show error notification
        }
    }
};

const confirmDeleteImage = (id: number) => {
    imageToDelete.value = id;
    deleteTarget.value = 'single';
    showDeleteConfirm.value = true;

    // Close preview if it's the image being deleted
    if (previewImage.value?.id === id) {
        showPreview.value = false;
    }
};

const confirmDeleteSelected = () => {
    deleteTarget.value = 'selected';
    showDeleteConfirm.value = true;

    // Close preview if the selected image is being deleted
    if (previewImage.value && imageStore.selectedImageIds.includes(previewImage.value.id)) {
        showPreview.value = false;
    }
};

const executeDelete = async () => {
    try {
        if (deleteTarget.value === 'selected') {
            await imageStore.deleteSelectedImages(projectId.value);
        } else {
            await imageStore.deleteImage(projectId.value, imageToDelete.value);
        }

        showDeleteConfirm.value = false;
        imageToDelete.value = 0;
    } catch (error) {
        console.error('Failed to delete image(s):', error);
        // Show error notification
    }
};

// Format helpers
const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(new Date(date));
};

// Import imageService for direct API calls
import imageService from '@/services/imageService';
</script>