<template>
    <div class="p-4 bg-gray-800 rounded-lg">
        <h3 class="text-white text-sm font-medium mb-2">Annotations</h3>

        <!-- Annotation list -->
        <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <div v-for="annotation in annotations" :key="annotation.id" @click="selectAnnotation(annotation.id)"
                class="flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors" :class="[
                    selectedAnnotationId === annotation.id
                        ? 'bg-gray-700 ring-2 ring-brand-purple'
                        : 'hover:bg-gray-700'
                ]">
                <div class="flex items-center">
                    <!-- Icon based on annotation type -->
                    <div class="w-8 h-8 rounded-md flex items-center justify-center"
                        :style="{ color: getClassColor(annotation.classId) }">
                        <component :is="getAnnotationIcon(annotation.type)" class="h-5 w-5" />
                    </div>

                    <!-- Annotation info -->
                    <div class="ml-2">
                        <span class="text-white text-sm">{{ getClassName(annotation.classId) }}</span>
                        <p class="text-gray-400 text-xs flex items-center">
                            {{ formatAnnotationType(annotation.type) }}

                            <!-- Hiển thị thông tin bổ sung dựa trên loại -->
                            <template v-if="annotation.type === 'bbox'">
                                <span class="ml-1 text-gray-500">
                                    ({{ annotation.coordinates.width.toFixed(0) }}×{{
                                        annotation.coordinates.height.toFixed(0) }})
                                </span>
                            </template>
                            <template v-else-if="annotation.type === 'polygon'">
                                <span class="ml-1 text-gray-500">
                                    ({{ annotation.coordinates.length }} points)
                                </span>
                            </template>
                            <template v-else-if="annotation.type === 'keypoint' || annotation.type === 'skeleton'">
                                <span class="ml-1 text-gray-500">
                                    ({{ getKeypointCount(annotation) }} points)
                                </span>
                            </template>
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-1">
                    <!-- Edit button - only for supported types -->
                    <button v-if="canEditAnnotation(annotation.type)" @click.stop="editAnnotation(annotation)"
                        class="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-600 transition-colors"
                        title="Edit annotation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>

                    <!-- Delete button -->
                    <button @click.stop="confirmDeleteAnnotation(annotation.id)"
                        class="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-600 transition-colors"
                        title="Delete annotation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="annotations.length === 0" class="text-center py-4 text-gray-400 italic text-sm">
            No annotations for this image
        </div>

        <!-- Delete confirmation modal -->
        <Modal v-model="showDeleteConfirm" title="Delete Annotation" size="sm">
            <p class="text-gray-700 mb-4">
                Are you sure you want to delete this annotation? This action cannot be undone.
            </p>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <Button @click="showDeleteConfirm = false" variant="outline">
                        Cancel
                    </Button>
                    <Button @click="executeDeleteAnnotation" variant="danger" :loading="isDeleting"
                        loading-text="Deleting...">
                        Delete
                    </Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import Modal from '@/components/common/Modal.vue';
import Button from '@/components/common/Button.vue';
import type { Annotation } from '@/types/annotation';
import * as Icons from './icons';

// Store
const annotationStore = useAnnotationStore();

// Local state
const showDeleteConfirm = ref(false);
const annotationToDelete = ref<number | null>(null);
const isDeleting = ref(false);

// Computed
const annotations = computed(() => annotationStore.annotations);
const selectedAnnotationId = computed(() => annotationStore.selectedAnnotationId);

// Methods
function selectAnnotation(id: number) {
    annotationStore.selectAnnotation(id);
}

function confirmDeleteAnnotation(id: number) {
    annotationToDelete.value = id;
    showDeleteConfirm.value = true;
}

async function executeDeleteAnnotation() {
    if (!annotationToDelete.value) return;

    isDeleting.value = true;

    try {
        await annotationStore.deleteAnnotation(annotationToDelete.value);
        showDeleteConfirm.value = false;
        annotationToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete annotation:', error);
        alert('Failed to delete annotation. Please try again.');
    } finally {
        isDeleting.value = false;
    }
}

function getClassName(classId: number): string {
    const cls = annotationStore.getClassById(classId);
    return cls?.name || 'Unknown';
}

function getClassColor(classId: number): string {
    const cls = annotationStore.getClassById(classId);
    return cls?.color || '#000000';
}

function getAnnotationIcon(type: string) {
    switch (type) {
        case 'bbox': return Icons.BboxIcon;
        case 'polygon': return Icons.PolygonIcon;
        case 'brush': return Icons.BrushIcon;
        case 'keypoint': return Icons.KeypointIcon;
        case 'skeleton': return Icons.SkeletonIcon;
        case 'classification': return Icons.ClassificationIcon;
        default: return Icons.BboxIcon;
    }
}

function formatAnnotationType(type: string): string {
    switch (type) {
        case 'bbox': return 'Bounding Box';
        case 'polygon': return 'Polygon';
        case 'brush': return 'Brush Mask';
        case 'keypoint': return 'Keypoint';
        case 'skeleton': return 'Skeleton';
        case 'classification': return 'Classification';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

function getKeypointCount(annotation: any): number {
    if (annotation.type === 'keypoint') {
        return annotation.coordinates.length;
    }
    if (annotation.type === 'skeleton') {
        return annotation.coordinates.points.length;
    }
    return 0;
}

// Kiểm tra xem loại chú thích này có thể chỉnh sửa không
function canEditAnnotation(type: string): boolean {
    // Chỉ cho phép chỉnh sửa một số loại chú thích
    return ['bbox', 'polygon', 'keypoint', 'skeleton'].includes(type);
}

function editAnnotation(annotation: Annotation) {
    // Thiết lập chế độ chỉnh sửa cho chú thích
    annotationStore.selectAnnotation(annotation.id);
    // TODO: Triển khai chế độ chỉnh sửa
    alert('Edit mode for annotation #' + annotation.id + ' not implemented yet');
}
</script>

<style scoped>
/* Custom scrollbar for the annotation list */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #2d3748;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #718096;
}
</style>