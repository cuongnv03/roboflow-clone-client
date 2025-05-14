<template>
    <div class="space-y-6">
        <h2 class="text-lg font-medium text-gray-900">Export Dataset</h2>

        <div class="space-y-4">
            <!-- Format selection -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <button v-for="format in availableFormats" :key="format" @click="selectedFormat = format"
                        class="px-4 py-3 border rounded-lg flex items-center transition-colors" :class="[
                            selectedFormat === format
                                ? 'border-brand-purple bg-purple-50 text-brand-purple'
                                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                        ]">
                        <FormatIcon :format="format" class="h-6 w-6 mr-2" />
                        <span class="font-medium">{{ formatName(format) }}</span>
                    </button>
                </div>
            </div>

            <!-- Export options -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <h3 class="font-medium text-gray-800 mb-3">Export Options</h3>

                <div class="space-y-3">
                    <!-- Include images -->
                    <div class="flex items-center">
                        <input id="includeImages" v-model="exportOptions.includeImages" type="checkbox"
                            class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                        <label for="includeImages" class="ml-2 text-sm text-gray-600">
                            Include images (increases export size)
                        </label>
                    </div>

                    <!-- Splits selection -->
                    <div>
                        <label class="block text-sm text-gray-700 mb-1">Include Splits</label>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="split in ['train', 'valid', 'test']" :key="split" class="flex items-center">
                                <input :id="`split-${split}`" v-model="selectedSplits" type="checkbox" :value="split"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label :for="`split-${split}`" class="ml-2 text-sm text-gray-600">
                                    {{ split.charAt(0).toUpperCase() + split.slice(1) }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Preview -->
            <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium text-gray-800">Export Preview</h3>

                    <button @click="loadPreview" class="text-brand-purple text-sm hover:underline flex items-center">
                        <RefreshIcon class="h-4 w-4 mr-1" />
                        Refresh Preview
                    </button>
                </div>

                <div v-if="previewLoading" class="h-48 flex items-center justify-center">
                    <svg class="animate-spin h-6 w-6 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </div>
                <pre v-else-if="previewSample"
                    class="text-xs text-gray-800 bg-gray-100 p-3 rounded-md border border-gray-300 max-h-48 overflow-auto">{{ previewSample }}</pre>
                <div v-else class="text-sm text-gray-500 text-center py-10">
                    Select a format and click "Refresh Preview" to see a sample of the export
                </div>
            </div>
        </div>

        <!-- Export actions -->
        <div class="flex justify-end space-x-3 mt-6">
            <Button variant="outline" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button variant="primary" @click="startExport" :disabled="!isValidExport || isExporting"
                :loading="isExporting" loading-text="Exporting...">
                Export Dataset
            </Button>
        </div>

        <!-- Export result modal -->
        <Modal v-model="showExportResult" title="Export Complete" size="md">
            <div v-if="exportResult" class="space-y-4">
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-green-800">Export completed successfully</h3>
                            <div class="mt-2 text-xs text-green-700">
                                <p>Format: {{ formatName(exportResult.format) }}</p>
                                <p>Images: {{ exportResult.imageCount }}</p>
                                <p>Annotations: {{ exportResult.annotationCount }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <a :href="getFullDownloadUrl(exportResult.downloadUrl)"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        target="_blank" rel="noopener noreferrer">
                        <DownloadIcon class="h-5 w-5 mr-2" />
                        Download Export Package
                    </a>
                </div>

                <div class="text-sm text-gray-500 mt-4">
                    <p>Your export will be available for download for 7 days.</p>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end">
                    <Button @click="showExportResult = false" variant="outline">
                        Close
                    </Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Button from '@/components/common/Button.vue';
import Modal from '@/components/common/Modal.vue';
import type { DatasetExportOptionsDTO, DatasetExportResultDTO } from '@/types/dataset';

const SERVER_URL = 'http://localhost:5000';

const props = defineProps<{
    datasetId: number;
    projectType: string;
    availableFormats: string[];
    previewSample: string | null;
    exportResult: DatasetExportResultDTO | null;
    previewLoading: boolean;
    isExporting: boolean;
}>();

const emit = defineEmits([
    'cancel',
    'export',
    'load-preview',
    'load-formats'
]);

// State
const selectedFormat = ref<string>('');
const selectedSplits = ref<string[]>(['train', 'valid', 'test']);
const showExportResult = ref(false);

// Export options
const exportOptions = ref<DatasetExportOptionsDTO>({
    format: 'coco',
    includeImages: true,
    exportSplits: ['train', 'valid', 'test']
});

// Computed
const isValidExport = computed(() => {
    return (
        selectedFormat.value !== '' &&
        selectedSplits.value.length > 0
    );
});

// Format name helper
const formatName = (format: string): string => {
    switch (format) {
        case 'coco':
            return 'COCO JSON';
        case 'yolo':
            return 'YOLO';
        case 'pascal_voc':
            return 'Pascal VOC';
        case 'createml':
            return 'Create ML';
        case 'tensorflow':
            return 'TensorFlow';
        default:
            return format.toUpperCase();
    }
};

// Watch for changes in selected format and splits
watch(selectedFormat, (newFormat) => {
    exportOptions.value.format = newFormat;
});

watch(selectedSplits, (newSplits) => {
    exportOptions.value.exportSplits = [...newSplits];
});

// Watch export result to show modal
watch(() => props.exportResult, (newResult) => {
    if (newResult) {
        showExportResult.value = true;
    }
});

// Load formats on mount
onMounted(() => {
    emit('load-formats', props.projectType);

    // Set default format if available
    if (props.availableFormats.length > 0 && !selectedFormat.value) {
        selectedFormat.value = props.availableFormats[0];
    }
});

// Methods
const loadPreview = () => {
    if (selectedFormat.value) {
        emit('load-preview', props.datasetId, selectedFormat.value);
    }
};

const startExport = () => {
    if (!isValidExport.value) return;

    emit('export', props.datasetId, {
        format: selectedFormat.value,
        includeImages: exportOptions.value.includeImages,
        exportSplits: selectedSplits.value
    });
};

const getFullDownloadUrl = (relativeUrl) => {
    // If already a full URL, return as is
    if (relativeUrl.startsWith('http')) {
        return relativeUrl;
    }

    // Otherwise prepend the API URL
    return `${SERVER_URL}${relativeUrl}`;
};
</script>

<script lang="ts">
// Define icons for export formats
import { defineComponent, h } from 'vue';

const FormatIcon = defineComponent({
    name: 'FormatIcon',
    props: {
        format: {
            type: String,
            required: true
        }
    },
    render() {
        // Return appropriate SVG based on format
        switch (this.format) {
            case 'coco':
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
                    h('polyline', { points: '14 2 14 8 20 8' }),
                    h('path', { d: 'M16 13H8' }),
                    h('path', { d: 'M16 17H8' }),
                    h('path', { d: 'M10 9H8' })
                ]);
            case 'yolo':
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
                    h('line', { x1: '3', y1: '9', x2: '21', y2: '9' }),
                    h('line', { x1: '3', y1: '15', x2: '21', y2: '15' }),
                    h('line', { x1: '9', y1: '3', x2: '9', y2: '21' }),
                    h('line', { x1: '15', y1: '3', x2: '15', y2: '21' })
                ]);
            case 'pascal_voc':
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('path', { d: 'M12 3v3m0 4.5v3m0 4.5v3M3 12h3m4.5 0h3m4.5 0h3' }),
                    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' })
                ]);
            case 'createml':
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('path', { d: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
                    h('circle', { cx: '12', cy: '12', r: '3' })
                ]);
            case 'tensorflow':
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('polygon', { points: '12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2' }),
                    h('line', { x1: '12', y1: '22', x2: '12', y2: '15.5' }),
                    h('polyline', { points: '22 8.5 12 15.5 2 8.5' }),
                    h('path', { d: 'M2 15.5 12 8.5 22 15.5' })
                ]);
            default:
                return h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                }, [
                    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
                    h('polyline', { points: '14 2 14 8 20 8' })
                ]);
        }
    }
});

// Icons for actions
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
            h('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
        ]);
    }
});

const DownloadIcon = defineComponent({
    name: 'DownloadIcon',
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
            h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
            h('polyline', { points: '7 10 12 15 17 10' }),
            h('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
        ]);
    }
});

export { FormatIcon, RefreshIcon, DownloadIcon };
</script>