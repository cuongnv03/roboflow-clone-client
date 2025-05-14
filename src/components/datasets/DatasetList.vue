<template>
    <div>
        <div v-if="datasets.length > 0" class="space-y-4">
            <div v-for="dataset in datasets" :key="dataset.id"
                class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                <div class="p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ dataset.name }}</h3>
                            <p class="text-sm text-gray-500 mb-3">
                                Created on {{ formatDate(dataset.createdDate) }}
                            </p>
                        </div>
                        <DatasetStatusBadge :status="dataset.status" />
                    </div>

                    <!-- Dataset stats -->
                    <div class="grid grid-cols-4 gap-4 mt-4">
                        <div class="bg-gray-50 p-3 rounded-lg text-center">
                            <p class="text-xs text-gray-500 uppercase">Total</p>
                            <p class="text-xl font-semibold text-gray-700">{{ dataset.imageCount.total }}</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-lg text-center">
                            <p class="text-xs text-blue-500 uppercase">Train</p>
                            <p class="text-xl font-semibold text-blue-600">{{ dataset.imageCount.train }}</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg text-center">
                            <p class="text-xs text-green-500 uppercase">Validation</p>
                            <p class="text-xl font-semibold text-green-600">{{ dataset.imageCount.valid }}</p>
                        </div>
                        <div class="bg-purple-50 p-3 rounded-lg text-center">
                            <p class="text-xs text-purple-500 uppercase">Test</p>
                            <p class="text-xl font-semibold text-purple-600">{{ dataset.imageCount.test }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <div class="flex space-x-2">
                        <button @click="$emit('edit', dataset)"
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Configure
                        </button>
                        <span class="text-gray-300">|</span>
                        <button @click="$emit('export', dataset)"
                            class="text-green-600 hover:text-green-800 text-sm font-medium">
                            Export
                        </button>
                        <span class="text-gray-300">|</span>
                        <button @click="confirmDelete(dataset.id)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Delete
                        </button>
                    </div>

                    <router-link :to="{ name: 'dataset-view', params: { datasetId: dataset.id } }"
                        class="btn btn-outline text-sm py-1 px-3">
                        View Details
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!isLoading"
            class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-gray-600 mb-4">You don't have any datasets yet</p>
            <button @click="$emit('create')" class="btn btn-primary">
                Create Your First Dataset
            </button>
        </div>

        <!-- Loading state -->
        <div v-else class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <!-- Delete confirmation modal -->
        <Modal v-model="showDeleteConfirm" title="Delete Dataset" size="sm">
            <p class="text-gray-700 mb-4">
                Are you sure you want to delete this dataset? This action cannot be undone.
            </p>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <Button @click="showDeleteConfirm = false" variant="outline">
                        Cancel
                    </Button>
                    <Button @click="executeDelete" variant="danger" :loading="deleteLoading" loading-text="Deleting...">
                        Delete Dataset
                    </Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { format } from 'date-fns';
import type { DatasetResponseDTO } from '@/types/dataset';
import Modal from '@/components/common/Modal.vue';
import Button from '@/components/common/Button.vue';
import DatasetStatusBadge from './DatasetStatusBadge.vue';

const props = defineProps<{
    datasets: DatasetResponseDTO[];
    isLoading: boolean;
}>();

const emit = defineEmits(['create', 'edit', 'export', 'delete']);

// Delete confirmation state
const showDeleteConfirm = ref(false);
const datasetToDelete = ref<number | null>(null);
const deleteLoading = ref(false);

// Format date helper
const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMM d, yyyy');
};

// Delete confirmation methods
const confirmDelete = (datasetId: number) => {
    datasetToDelete.value = datasetId;
    showDeleteConfirm.value = true;
};

const executeDelete = async () => {
    if (!datasetToDelete.value) return;

    deleteLoading.value = true;

    try {
        await emit('delete', datasetToDelete.value);
        showDeleteConfirm.value = false;
    } finally {
        deleteLoading.value = false;
        datasetToDelete.value = null;
    }
};
</script>