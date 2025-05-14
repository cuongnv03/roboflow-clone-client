<template>
    <div class="space-y-4">
        <!-- Split Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
                <button v-for="split in splits" :key="split.id" @click="activeTab = split.id"
                    class="group inline-flex items-center py-3 px-4 mr-2 border-b-2 font-medium text-sm" :class="[
                        activeTab === split.id
                            ? `border-${split.color}-500 text-${split.color}-600`
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                    <div :class="`rounded-full bg-${split.color}-500 w-3 h-3 mr-2`"></div>
                    {{ split.name }}
                    <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" :class="[
                        `bg-${split.color}-100 text-${split.color}-800`
                    ]">
                        {{ imagesBySplit[split.id].length }}
                    </span>
                </button>
            </nav>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-8">
            <svg class="animate-spin h-6 w-6 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <!-- No images state -->
        <div v-else-if="totalImages === 0" class="text-center py-8">
            <p class="text-gray-500">No images available in this dataset.</p>
            <button @click="$emit('regenerate-splits')" class="mt-4 text-sm text-brand-purple">
                Generate Splits
            </button>
        </div>

        <!-- Split content -->
        <div v-else>
            <!-- Image count in current split -->
            <div class="flex justify-between items-center mb-2">
                <p class="text-sm text-gray-500">
                    {{ imagesBySplit[activeTab].length }} images in this split
                </p>

                <div class="flex items-center">
                    <div v-if="selectedImages.length > 0" class="flex items-center mr-4">
                        <span class="text-sm text-gray-700 mr-2">{{ selectedImages.length }} selected</span>
                        <button @click="selectedImages = []" class="text-sm text-red-600 hover:text-red-800">
                            Clear
                        </button>
                    </div>

                    <div class="relative move-menu-container" v-if="selectedImages.length > 0">
                        <button @click.stop="toggleMoveMenu"
                            class="btn btn-outline text-sm py-1 px-3 flex items-center">
                            Move to
                            <svg class="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>

                        <div v-if="showMoveMenu"
                            class="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div class="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
                                <template v-for="split in availableSplits" :key="split.id">
                                    <button @click="moveSelectedImages(split.id)"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        role="menuitem">
                                        <span class="flex items-center">
                                            <div :class="`rounded-full bg-${split.color}-500 w-3 h-3 mr-2`"></div>
                                            Move to {{ split.name }}
                                        </span>
                                    </button>
                                </template>

                                <div v-if="availableSplits.length === 0" class="px-4 py-2 text-sm text-gray-500 italic">
                                    No other splits available
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Image grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div v-for="imageId in imagesBySplit[activeTab]" :key="imageId"
                    class="relative overflow-hidden rounded-lg border hover:border-brand-purple transition-colors"
                    :class="[selectedImages.includes(imageId) ? 'border-brand-purple' : 'border-gray-200']">
                    <!-- Image thumbnail -->
                    <div class="aspect-w-1 aspect-h-1 bg-gray-100 overflow-hidden">
                        <ImageThumbnail :image-id="imageId" :selected="selectedImages.includes(imageId)"
                            @select="toggleSelectImage" />
                    </div>
                </div>
            </div>

            <!-- Empty split state -->
            <div v-if="imagesBySplit[activeTab].length === 0" class="text-center py-8">
                <p class="text-gray-500">No images in this split.</p>
            </div>
        </div>

        <!-- Pagination (we'll implement this later if needed) -->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useImageStore } from '@/stores/image';
import ImageThumbnail from './ImageThumbnail.vue';

const props = defineProps<{
    datasetId: number;
    imagesBySplit: Record<string, number[]>;
    totalImages: number;
    isLoading: boolean;
}>();

const emit = defineEmits(['update-splits', 'regenerate-splits']);

// Local state
const activeTab = ref('train');
const selectedImages = ref<number[]>([]);
const showMoveMenu = ref(false);

// Image store for thumbnails
const imageStore = useImageStore();

// Splits configuration
const splits = [
    { id: 'train', name: 'Training', color: 'blue' },
    { id: 'valid', name: 'Validation', color: 'green' },
    { id: 'test', name: 'Testing', color: 'purple' }
];

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    // Only close if clicking outside the dropdown and its toggle button
    if (showMoveMenu.value &&
        !(event.target as Element).closest('.move-menu-container')) {
        showMoveMenu.value = false;
    }
};

const availableSplits = computed(() => {
    return splits.filter(s => s.id !== activeTab.value);
});

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Methods
const toggleSelectImage = (imageId: number) => {
    const index = selectedImages.value.indexOf(imageId);
    if (index === -1) {
        selectedImages.value.push(imageId);
    } else {
        selectedImages.value.splice(index, 1);
    }
};

const moveSelectedImages = async (targetSplit: string) => {
    if (selectedImages.value.length === 0) return;

    try {
        // Update split assignments
        await emit('update-splits', {
            imageIds: selectedImages.value,
            split: targetSplit
        });

        // Show success message or feedback
        console.log(`Moved ${selectedImages.value.length} images to ${targetSplit} split`);
    } catch (error) {
        // Handle error
        console.error('Failed to move images:', error);
    } finally {
        // Close menu and clear selection regardless of success or failure
        showMoveMenu.value = false;
        selectedImages.value = [];
    }
};

const toggleMoveMenu = () => {
    showMoveMenu.value = !showMoveMenu.value;
};
</script>