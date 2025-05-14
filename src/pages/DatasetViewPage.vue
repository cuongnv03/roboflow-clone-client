<template>
    <div>
        <!-- Page header -->
        <div class="mb-6 flex justify-between items-start">
            <div>
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-gray-900">
                        {{ datasetStore.activeDataset?.name || 'Dataset Details' }}
                    </h1>
                    <DatasetStatusBadge v-if="datasetStore.activeDataset" :status="datasetStore.activeDataset.status"
                        class="ml-3" />
                </div>
                <p class="text-gray-600 mt-1">
                    View and manage your dataset configuration
                </p>
            </div>

            <div class="flex space-x-2">
                <Button variant="outline" @click="confirmDeleteDataset">
                    <TrashIcon class="h-4 w-4 mr-1" />
                    Delete
                </Button>
                <Button variant="primary" @click="openExportModal">
                    <ExportIcon class="h-4 w-4 mr-1" />
                    Export
                </Button>
            </div>
        </div>

        <div v-if="datasetStore.loading" class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <div v-else-if="datasetStore.activeDataset" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Left Column: Stats & Distribution -->
            <div class="space-y-6">
                <!-- Dataset Statistics -->
                <Card>
                    <template #header>
                        <h2 class="text-lg font-semibold">Dataset Statistics</h2>
                    </template>

                    <div class="space-y-4">
                        <!-- Basic info -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">Created</p>
                                <p class="font-medium">{{ formatDate(datasetStore.activeDataset.createdDate) }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Status</p>
                                <p class="font-medium">{{ formatStatus(datasetStore.activeDataset.status) }}</p>
                            </div>
                        </div>

                        <!-- Image counts -->
                        <div>
                            <p class="text-sm text-gray-500 mb-2">Images by Split</p>
                            <div class="bg-gray-100 rounded-lg p-4">
                                <div class="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase">Total</p>
                                        <p class="text-xl font-bold text-gray-700">{{
                                            datasetStore.activeDataset.imageCount.total }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-blue-500 uppercase">Train</p>
                                        <p class="text-xl font-bold text-blue-600">{{
                                            datasetStore.activeDataset.imageCount.train }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-green-500 uppercase">Valid</p>
                                        <p class="text-xl font-bold text-green-600">{{
                                            datasetStore.activeDataset.imageCount.valid }}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-purple-500 uppercase">Test</p>
                                        <p class="text-xl font-bold text-purple-600">{{
                                            datasetStore.activeDataset.imageCount.test }}</p>
                                    </div>
                                </div>

                                <!-- Split ratio visualization -->
                                <div class="mt-3">
                                    <div class="w-full flex h-2 rounded-full overflow-hidden">
                                        <div class="bg-blue-500" :style="`width: ${getSplitPercentage('train')}%`">
                                        </div>
                                        <div class="bg-green-500" :style="`width: ${getSplitPercentage('valid')}%`">
                                        </div>
                                        <div class="bg-purple-500" :style="`width: ${getSplitPercentage('test')}%`">
                                        </div>
                                    </div>
                                    <div class="flex justify-between text-xs mt-1 text-gray-500">
                                        <span>{{ getSplitPercentage('train') }}%</span>
                                        <span>{{ getSplitPercentage('valid') }}%</span>
                                        <span>{{ getSplitPercentage('test') }}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <!-- Configuration summary -->
                <Card>
                    <template #header>
                        <h2 class="text-lg font-semibold">Configuration</h2>
                    </template>

                    <div class="space-y-4">
                        <!-- Preprocessing settings -->
                        <div>
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Preprocessing</h3>
                            <ul class="text-sm space-y-1">
                                <li v-if="hasPreprocessingSetting('resize')">
                                    <span class="text-gray-600">Resize:</span>
                                    <span>{{ datasetStore.activeDataset.preprocessing.resize.width }} × {{
                                        datasetStore.activeDataset.preprocessing.resize.height }}</span>
                                </li>
                                <li v-if="hasPreprocessingSetting('autoOrient')">
                                    <span class="text-gray-600">Auto-Orient:</span>
                                    <span>{{ datasetStore.activeDataset.preprocessing.autoOrient ? 'Enabled' :
                                        'Disabled' }}</span>
                                </li>
                                <li v-if="hasPreprocessingSetting('normalize')">
                                    <span class="text-gray-600">Normalize:</span>
                                    <span>{{ datasetStore.activeDataset.preprocessing.normalize ? 'Enabled' : 'Disabled'
                                        }}</span>
                                </li>
                                <li v-if="hasPreprocessingSetting('grayscale')">
                                    <span class="text-gray-600">Grayscale:</span>
                                    <span>{{ datasetStore.activeDataset.preprocessing.grayscale ? 'Enabled' : 'Disabled'
                                        }}</span>
                                </li>
                                <li v-if="!hasAnyPreprocessingSettings">
                                    <span class="text-gray-500 italic">No preprocessing settings configured</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Augmentation settings -->
                        <div>
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Augmentation</h3>
                            <div v-if="datasetStore.activeDataset.augmentation?.enabled">
                                <ul class="text-sm space-y-1">
                                    <li v-if="hasAugmentationSetting('rotation')">
                                        <span class="text-gray-600">Rotation:</span>
                                        <span>{{ datasetStore.activeDataset.augmentation.rotation.min }}° to {{
                                            datasetStore.activeDataset.augmentation.rotation.max }}°</span>
                                    </li>
                                    <li v-if="hasAugmentationSetting('flip')">
                                        <span class="text-gray-600">Flip:</span>
                                        <span>
                                            {{ getFlipDescription() }}
                                        </span>
                                    </li>
                                    <li v-if="hasAugmentationSetting('brightness')">
                                        <span class="text-gray-600">Brightness:</span>
                                        <span>{{ datasetStore.activeDataset.augmentation.brightness.min }}× to {{
                                            datasetStore.activeDataset.augmentation.brightness.max }}×</span>
                                    </li>
                                    <li v-if="hasAugmentationSetting('contrast')">
                                        <span class="text-gray-600">Contrast:</span>
                                        <span>{{ datasetStore.activeDataset.augmentation.contrast.min }}× to {{
                                            datasetStore.activeDataset.augmentation.contrast.max }}×</span>
                                    </li>
                                    <li v-if="hasAugmentationSetting('noise')">
                                        <span class="text-gray-600">Noise:</span>
                                        <span>{{ datasetStore.activeDataset.augmentation.noise ? 'Enabled' : 'Disabled'
                                            }}</span>
                                    </li>
                                </ul>
                            </div>
                            <div v-else>
                                <p class="text-sm text-gray-500 italic">Augmentation is disabled</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <!-- Middle & Right Columns: Dataset Split Management -->
            <div class="md:col-span-2 space-y-6">
                <Card>
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h2 class="text-lg font-semibold">Split Management</h2>
                            <Button variant="outline" size="sm" @click="regenerateSplits">
                                <RefreshIcon class="h-4 w-4 mr-1" />
                                Regenerate Splits
                            </Button>
                        </div>
                    </template>

                    <DatasetSplitManager :dataset-id="datasetId" :images-by-split="datasetStore.imagesByTrainSplit"
                        :total-images="datasetStore.activeDataset.imageCount.total" :is-loading="datasetStore.isLoading"
                        @update-splits="handleUpdateSplits" />
                </Card>

                <!-- Empty state if no images -->
                <div v-if="datasetStore.activeDataset.imageCount.total === 0"
                    class="bg-white rounded-lg shadow p-8 text-center">
                    <div class="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 class="mt-4 text-lg font-medium text-gray-900">No Images in Dataset</h3>
                    <p class="mt-2 text-gray-500">This dataset doesn't have any images assigned to it yet.</p>
                    <div class="mt-6">
                        <Button variant="primary" @click="regenerateSplits">
                            Regenerate Splits
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="datasetStore.datasetError" class="bg-red-50 border border-red-300 rounded-md p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error loading dataset</h3>
                    <p class="mt-1 text-sm text-red-700">{{ datasetStore.datasetError }}</p>
                </div>
            </div>
        </div>

        <!-- Export dataset modal -->
        <Modal v-model="showExportModal" title="Export Dataset">
            <DatasetExport v-if="showExportModal && datasetStore.activeDataset" :dataset-id="datasetId"
                :project-type="projectType" :available-formats="datasetStore.exportFormats"
                :preview-sample="datasetStore.exportPreview" :export-result="datasetStore.exportResult"
                :preview-loading="datasetStore.isLoading" :is-exporting="datasetStore.isExporting"
                @cancel="showExportModal = false" @export="handleExportDataset" @load-preview="loadExportPreview"
                @load-formats="loadExportFormats" />
        </Modal>

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
                    <Button @click="executeDeleteDataset" variant="danger" :loading="deleteLoading"
                        loading-text="Deleting...">
                        Delete Dataset
                    </Button>
                </div>
            </template>
        </Modal>

        <!-- Split regeneration modal -->
        <Modal v-model="showSplitModal" title="Regenerate Dataset Splits">
            <div class="space-y-4">
                <p class="text-gray-700">
                    Choose how you want to split your dataset images. This will override any existing split assignments.
                </p>

                <div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Split Strategy</label>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input id="randomSplit" v-model="splitStrategy" type="radio" value="random"
                                    class="h-4 w-4 border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="randomSplit" class="ml-2 text-sm text-gray-600">
                                    Random split
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="manualSplit" v-model="splitStrategy" type="radio" value="manual"
                                    class="h-4 w-4 border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="manualSplit" class="ml-2 text-sm text-gray-600">
                                    Manual assignment (use the split manager)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div v-if="splitStrategy === 'random'" class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Split Ratio</label>
                        <div class="grid grid-cols-3 gap-2">
                            <div>
                                <label for="trainSplit" class="block text-xs text-gray-500">Train</label>
                                <div class="flex items-center">
                                    <input id="trainSplit" v-model.number="splitRatio.train" type="number" min="0"
                                        max="1" step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('train')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label for="validSplit" class="block text-xs text-gray-500">Validation</label>
                                <div class="flex items-center">
                                    <input id="validSplit" v-model.number="splitRatio.valid" type="number" min="0"
                                        max="1" step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('valid')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label for="testSplit" class="block text-xs text-gray-500">Test</label>
                                <div class="flex items-center">
                                    <input id="testSplit" v-model.number="splitRatio.test" type="number" min="0" max="1"
                                        step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('test')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-1">
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div class="flex h-2.5 rounded-full overflow-hidden">
                                    <div class="bg-blue-600" :style="`width: ${splitRatio.train * 100}%`"></div>
                                    <div class="bg-green-500" :style="`width: ${splitRatio.valid * 100}%`"></div>
                                    <div class="bg-purple-500" :style="`width: ${splitRatio.test * 100}%`"></div>
                                </div>
                            </div>
                            <p :class="splitTotal === 1 ? 'text-green-600' : 'text-red-600'" class="text-xs text-right">
                                Total: {{ (splitTotal * 100).toFixed(0) }}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <Button @click="showSplitModal = false" variant="outline">
                        Cancel
                    </Button>
                    <Button @click="executeSplitGeneration" variant="primary"
                        :disabled="splitStrategy === 'random' && splitTotal !== 1" :loading="splitGenerationLoading"
                        loading-text="Generating...">
                        Generate Splits
                    </Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { useDatasetStore } from '@/stores/dataset';
import { useProjectStore } from '@/stores/project';
import type { DatasetSplitDTO, DatasetImageAssignDTO, DatasetExportOptionsDTO } from '@/types/dataset';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';
import Modal from '@/components/common/Modal.vue';
import DatasetStatusBadge from '@/components/datasets/DatasetStatusBadge.vue';
import DatasetExport from '@/components/datasets/DatasetExport.vue';
import DatasetSplitManager from '@/components/datasets/DatasetSplitManager.vue';

// Router and stores
const route = useRoute();
const router = useRouter();
const datasetStore = useDatasetStore();
const projectStore = useProjectStore();

// IDs from route
const projectId = computed(() => Number(route.params.projectId));
const datasetId = computed(() => Number(route.params.datasetId));

// Get project type for export format options
const projectType = computed(() => {
    return projectStore.activeProject?.type || 'object_detection';
});

// UI state
const showExportModal = ref(false);
const showDeleteConfirm = ref(false);
const showSplitModal = ref(false);
const deleteLoading = ref(false);
const splitGenerationLoading = ref(false);

// Split regeneration state
const splitStrategy = ref<'random' | 'manual'>('random');
const splitRatio = ref({
    train: 0.7,
    valid: 0.2,
    test: 0.1
});

// Computed properties
const splitTotal = computed(() => {
    return splitRatio.value.train + splitRatio.value.valid + splitRatio.value.test;
});

const hasAnyPreprocessingSettings = computed(() => {
    const preprocessing = datasetStore.activeDataset?.preprocessing;
    if (!preprocessing) return false;

    return (
        preprocessing.enableResize ||
        preprocessing.autoOrient ||
        preprocessing.normalize ||
        preprocessing.grayscale
    );
});

// Lifecycle hooks
onMounted(async () => {
    if (datasetId.value) {
        await datasetStore.fetchDataset(datasetId.value);
    }
});

// Watch for route changes to load new dataset
watch(() => route.params.datasetId, async (newId) => {
    if (newId) {
        await datasetStore.fetchDataset(Number(newId));
    }
});

// Methods
const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMMM d, yyyy');
};

const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSplitPercentage = (split: 'train' | 'valid' | 'test'): number => {
    const dataset = datasetStore.activeDataset;
    if (!dataset) return 0;

    const total = dataset.imageCount.total;
    if (total === 0) return 0;

    return Math.round((dataset.imageCount[split] / total) * 100);
};

const hasPreprocessingSetting = (setting: string): boolean => {
    const preprocessing = datasetStore.activeDataset?.preprocessing;
    if (!preprocessing) return false;

    if (setting === 'resize') {
        return !!preprocessing.enableResize;
    }

    return !!preprocessing[setting as keyof typeof preprocessing];
};

const hasAugmentationSetting = (setting: string): boolean => {
    const augmentation = datasetStore.activeDataset?.augmentation;
    if (!augmentation || !augmentation.enabled) return false;

    return !!augmentation[setting as keyof typeof augmentation];
};

const getFlipDescription = (): string => {
    const flip = datasetStore.activeDataset?.augmentation?.flip;
    if (!flip) return 'None';

    if (flip.horizontal && flip.vertical) {
        return 'Horizontal & Vertical';
    } else if (flip.horizontal) {
        return 'Horizontal only';
    } else if (flip.vertical) {
        return 'Vertical only';
    }

    return 'None';
};

const openExportModal = () => {
    showExportModal.value = true;
};

const confirmDeleteDataset = () => {
    showDeleteConfirm.value = true;
};

const executeDeleteDataset = async () => {
    if (!datasetId.value) return;

    deleteLoading.value = true;

    try {
        await datasetStore.deleteDataset(datasetId.value);
        showDeleteConfirm.value = false;

        // Navigate back to datasets list
        router.push({
            name: 'project-datasets',
            params: { projectId: projectId.value }
        });
    } catch (error) {
        console.error('Failed to delete dataset:', error);
    } finally {
        deleteLoading.value = false;
    }
};

const regenerateSplits = () => {
    showSplitModal.value = true;
};

const updateSplitRatio = (field: 'train' | 'valid' | 'test') => {
    const total = splitTotal.value;

    // If total is greater than 1, adjust other fields proportionally
    if (total > 1) {
        const excess = total - 1;
        const otherFields = ['train', 'valid', 'test'].filter(f => f !== field) as Array<'train' | 'valid' | 'test'>;

        // Distribute excess proportionally between other fields
        const totalOthers = otherFields.reduce((sum, f) => sum + splitRatio.value[f], 0);

        if (totalOthers > 0) {
            otherFields.forEach(f => {
                const proportion = splitRatio.value[f] / totalOthers;
                splitRatio.value[f] = Math.max(0, splitRatio.value[f] - excess * proportion);
            });
        }
    }

    // Round to 2 decimal places
    Object.keys(splitRatio.value).forEach(key => {
        splitRatio.value[key as keyof typeof splitRatio.value] =
            Math.round(splitRatio.value[key as keyof typeof splitRatio.value] * 100) / 100;
    });
};

const executeSplitGeneration = async () => {
    if (!datasetId.value) return;

    splitGenerationLoading.value = true;

    try {
        const splitConfig: DatasetSplitDTO = {
            strategy: splitStrategy.value
        };

        if (splitStrategy.value === 'random') {
            splitConfig.ratio = {
                train: splitRatio.value.train,
                valid: splitRatio.value.valid,
                test: splitRatio.value.test
            };
        }

        await datasetStore.generateSplit(datasetId.value, splitConfig);
        showSplitModal.value = false;
    } catch (error) {
        console.error('Failed to generate splits:', error);
    } finally {
        splitGenerationLoading.value = false;
    }
};

const handleUpdateSplits = async (assignData: DatasetImageAssignDTO) => {
    if (!datasetId.value) return;

    try {
        await datasetStore.assignImagesToSplit(datasetId.value, assignData);
    } catch (error) {
        console.error('Failed to update splits:', error);
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

<script lang="ts">
// Import icons
import { defineComponent, h } from 'vue';

const TrashIcon = defineComponent({
    name: 'TrashIcon',
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        }, [
            h('polyline', { points: '3 6 5 6 21 6' }),
            h('path', { d: 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2' }),
            h('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
            h('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
        ]);
    }
});

const ExportIcon = defineComponent({
    name: 'ExportIcon',
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        }, [
            h('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' }),
            h('polyline', { points: '17 8 12 3 7 8' }),
            h('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
        ]);
    }
});

const RefreshIcon = defineComponent({
    name: 'RefreshIcon',
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        }, [
            h('path', { d: 'M23 4v6h-6' }),
            h('path', { d: 'M1 20v-6h6' }),
            h('path', { d: 'M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15' })
        ]);
    }
});

export { TrashIcon, ExportIcon, RefreshIcon };
</script>