<template>
    <div class="p-3 bg-gray-800 rounded-lg mb-4 space-y-2">
        <h3 class="text-white text-sm font-medium mb-2">Annotation Tools</h3>

        <div class="flex flex-wrap gap-2">
            <!-- Tool buttons -->
            <button v-for="tool in availableTools" :key="tool.type" @click="selectTool(tool.type)" class="tool-btn"
                :class="{ active: currentTool === tool.type }" :title="tool.label">
                <component :is="tool.icon" class="h-5 w-5" />
                <span class="ml-1">{{ tool.label }}</span>
            </button>

            <!-- Reset tool button -->
            <button @click="resetTool" class="tool-btn" :title="currentTool ? 'Cancel drawing' : 'No tool selected'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span class="ml-1">Cancel</span>
            </button>
        </div>

        <!-- Selected class indicator -->
        <div class="mt-3">
            <h3 class="text-white text-sm font-medium mb-2">Selected Class</h3>
            <div v-if="selectedClass" class="p-2 rounded-md border border-gray-700"
                :style="{ backgroundColor: `${selectedClass.color}22` }">
                <div class="flex items-center space-x-2">
                    <span class="w-4 h-4 rounded-full inline-block"
                        :style="{ backgroundColor: selectedClass.color }"></span>
                    <span class="text-white">{{ selectedClass.name }}</span>
                </div>
            </div>
            <div v-else class="text-gray-400 text-sm italic">No class selected</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import type { AnnotationType } from '@/types/annotation';

const props = defineProps<{
    projectType: string;
    projectId: number;
}>();

const emit = defineEmits<{
    (e: 'tool-change', tool: AnnotationType | null): void;
}>();

// Store
const annotationStore = useAnnotationStore();

// Tool icons
const BboxIcon = {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M3.75 7.5v9m16.5-9v9" />
      </svg>
    `
};

const PolygonIcon = {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    `
};

const KeypointIcon = {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    `
};

const ClassificationIcon = {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    `
};

// Available annotation tools based on project type
const availableTools = computed(() => {
    const tools = [
        {
            type: 'bbox' as const,
            label: 'Bounding Box',
            icon: BboxIcon,
            projectTypes: ['object_detection', 'instance_segmentation']
        },
        {
            type: 'polygon' as const,
            label: 'Polygon',
            icon: PolygonIcon,
            projectTypes: ['instance_segmentation']
        },
        {
            type: 'keypoint' as const,
            label: 'Keypoint',
            icon: KeypointIcon,
            projectTypes: ['keypoint_detection']
        },
        {
            type: 'classification' as const,
            label: 'Classification',
            icon: ClassificationIcon,
            projectTypes: ['classification']
        }
    ];

    return tools.filter(tool => tool.projectTypes.includes(props.projectType));
});

// Current tool
const currentTool = computed(() => annotationStore.drawingState.currentTool);

// Selected class
const selectedClass = computed(() => annotationStore.selectedClass);

// Fetch classes on mount
onMounted(async () => {
    await annotationStore.fetchClasses(props.projectId);
});

// Methods
function selectTool(tool: AnnotationType) {
    if (!selectedClass.value) {
        // Show error or alert user to select a class first
        alert('Please select a class first');
        return;
    }

    annotationStore.setCurrentTool(tool);
    emit('tool-change', tool);
}

function resetTool() {
    annotationStore.setCurrentTool(null);
    annotationStore.cancelDrawing();
    emit('tool-change', null);
}
</script>

<style scoped>
.tool-btn {
    @apply flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded-md text-sm transition-colors;
}

.tool-btn:hover {
    @apply bg-gray-600 text-white;
}

.tool-btn.active {
    @apply bg-brand-purple text-white;
}
</style>