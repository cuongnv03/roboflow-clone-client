<template>
    <div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Datasets</h1>
            <p class="text-gray-600 mt-1">Prepare your data for training and export</p>
        </div>

        <!-- Create dataset form -->
        <Card v-if="showCreateForm" class="mb-8">
            <template #header>
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-semibold">Create New Dataset</h2>
                    <button @click="showCreateForm = false" class="text-gray-400 hover:text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </template>

            <DatasetForm :project-id="projectId" :is-loading="datasetStore.isLoading" @submit="handleCreateDataset"
                @cancel="showCreateForm = false" />
        </Card>

        <!-- Export dataset modal -->
        <Modal v-model="showExportModal" title="Export Dataset">
            <DatasetExport v-if="showExportModal && datasetToExport" :dataset-id="datasetToExport.id"
                :project-type="projectType" :available-formats="datasetStore.exportFormats"
                :preview-sample="datasetStore.exportPreview" :export-result="datasetStore.exportResult"
                :preview-loading="datasetStore.isLoading" :is-exporting="datasetStore.isExporting"
                @cancel="showExportModal = false" @export="handleExportDataset" @load-preview="loadExportPreview"
                @load-formats="loadExportFormats" />
        </Modal>

        <!-- Datasets list -->
        <DatasetList :datasets="datasetStore.datasets" :is-loading="datasetStore.isLoading"
            @create="showCreateForm = true" @edit="navigateToDataset" @export="openExportModal"
            @delete="handleDeleteDataset" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDatasetStore } from '@/stores/dataset';
import { useProjectStore } from '@/stores/project';
import type { DatasetResponseDTO, DatasetCreateDTO, DatasetExportOptionsDTO } from '@/types/dataset';
import Card from '@/components/common/Card.vue';
import Modal from '@/components/common/Modal.vue';
import DatasetForm from '@/components/datasets/DatasetForm.vue';
import DatasetList from '@/components/datasets/DatasetList.vue';
import DatasetExport from '@/components/datasets/DatasetExport.vue';

// Router and stores
const route = useRoute();
const router = useRouter();
const datasetStore = useDatasetStore();
const projectStore = useProjectStore();

// Get project ID from route
const projectId = computed(() => Number(route.params.projectId));

// Get project type for export format options
const projectType = computed(() => {
    return projectStore.activeProject?.type || 'object_detection';
});

// UI state
const showCreateForm = ref(false);
const showExportModal = ref(false);
const datasetToExport = ref<DatasetResponseDTO | null>(null);

// Lifecycle hooks
onMounted(async () => {
    if (projectId.value) {
        await datasetStore.fetchDatasets(projectId.value);
    }
});

// Methods
const handleCreateDataset = async (data: DatasetCreateDTO) => {
    try {
        const newDataset = await datasetStore.createDataset(data);
        showCreateForm.value = false;

        // Navigate to the new dataset
        router.push({
            name: 'dataset-view',
            params: {
                projectId: projectId.value.toString(),
                datasetId: newDataset.id.toString()
            }
        });
    } catch (error) {
        console.error('Failed to create dataset:', error);
    }
};

const navigateToDataset = (dataset: DatasetResponseDTO) => {
    router.push({
        name: 'dataset-view',
        params: {
            projectId: projectId.value.toString(),
            datasetId: dataset.id.toString()
        }
    });
};

const openExportModal = (dataset: DatasetResponseDTO) => {
    datasetToExport.value = dataset;
    showExportModal.value = true;
};

const handleDeleteDataset = async (datasetId: number) => {
    try {
        await datasetStore.deleteDataset(datasetId);
    } catch (error) {
        console.error('Failed to delete dataset:', error);
    }
};

const loadExportFormats = async (projectType: string) => {
    try {
        await datasetStore.fetchExportFormats(projectType);
    } catch (error) {
        console.error('Failed to load export formats:', error);
    }
};

const loadExportPreview = async (datasetId: number, format: string) => {
    try {
        await datasetStore.fetchExportPreview(datasetId, format);
    } catch (error) {
        console.error('Failed to load export preview:', error);
    }
};

const handleExportDataset = async (datasetId: number, options: DatasetExportOptionsDTO) => {
    try {
        await datasetStore.exportDataset(datasetId, options);
    } catch (error) {
        console.error('Failed to export dataset:', error);
    }
};
</script>