<template>
    <div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Annotate Images</h1>
            <p class="text-gray-600 mt-1">Create annotations for your project images</p>
        </div>

        <div v-if="!imageStore.images.length && !imageStore.isLoading"
            class="text-center py-16 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 class="text-xl font-semibold text-gray-700 mb-2">No Images Available</h2>
            <p class="text-gray-500 mb-6">Upload images first to start annotating</p>
            <Button variant="primary" @click="goToUpload">
                Go to Upload Page
            </Button>
        </div>

        <div v-else-if="imageStore.isLoading" class="flex justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Left sidebar - tools and classes -->
            <div class="space-y-6">
                <!-- Enhanced Drawing Tools -->
                <EnhancedDrawingTools :project-type="projectType" @tool-change="onToolChange"
                    @settings-change="onToolSettingsChange" />

                <!-- Class selector -->
                <ClassSelector :project-id="projectId" />
            </div>

            <!-- Center - annotation canvas -->
            <div class="md:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <!-- Image navigation bar -->
                <div class="p-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-medium text-gray-900">Annotation Canvas</h2>

                        <div class="flex space-x-2">
                            <button @click="goToPrevImage" class="p-1 rounded-md hover:bg-gray-100"
                                :disabled="!hasPrevImage" :class="{ 'opacity-50 cursor-not-allowed': !hasPrevImage }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <select v-model="currentImageId"
                                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple">
                                <option v-for="img in imageStore.images" :key="img.id" :value="img.id">
                                    {{ img.originalFilename }}
                                </option>
                            </select>

                            <button @click="goToNextImage" class="p-1 rounded-md hover:bg-gray-100"
                                :disabled="!hasNextImage" :class="{ 'opacity-50 cursor-not-allowed': !hasNextImage }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Canvas container -->
                <div class="flex-1 min-h-[500px] relative">
                    <AnnotationCanvas v-if="currentImage" :image="currentImage" :project-type="projectType"
                        :loading="annotationStore.loading" :tool-settings="toolSettings" />
                </div>

                <!-- Cập nhật status bar -->
                <div class="p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between">
                    <div v-if="currentImage" class="flex items-center space-x-2">
                        <span>{{ currentImage.width }}×{{ currentImage.height }}</span>
                        <span class="text-gray-300">|</span>
                        <span>{{ formatStatus(currentImage.status) }}</span>
                    </div>

                    <div class="flex items-center space-x-4">
                        <div v-if="annotationStore.history.length > 0" class="text-xs text-gray-400 flex items-center">
                            <span v-if="annotationStore.canUndo" class="text-brand-purple cursor-pointer mr-1"
                                @click="annotationStore.undo()" title="Undo">
                                <UndoIcon class="inline h-3.5 w-3.5" />
                            </span>
                            <span>{{ annotationStore.historyIndex + 1 }}/{{ annotationStore.history.length }}</span>
                            <span v-if="annotationStore.canRedo" class="text-brand-purple cursor-pointer ml-1"
                                @click="annotationStore.redo()" title="Redo">
                                <RedoIcon class="inline h-3.5 w-3.5" />
                            </span>
                        </div>

                        <div v-if="annotationStore.annotations.length > 0">
                            {{ annotationStore.annotations.length }} annotation{{ annotationStore.annotations.length > 1
                                ? 's' : '' }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right sidebar - annotations list and properties -->
            <div class="space-y-6">
                <!-- Annotations list -->
                <AnnotationList />

                <!-- Properties panel (when annotation is selected) -->
                <div v-if="annotationStore.selectedAnnotation" class="p-4 bg-gray-800 rounded-lg">
                    <h3 class="text-white text-sm font-medium mb-3">Properties</h3>

                    <div class="space-y-3">
                        <!-- Class dropdown -->
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Class</label>
                            <select v-model="selectedAnnotationClass"
                                class="w-full bg-gray-700 border border-gray-600 rounded-md text-white py-1.5 px-3 text-sm"
                                @change="updateAnnotationClass">
                                <option v-for="cls in annotationStore.classes" :key="cls.id" :value="cls.id">
                                    {{ cls.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Visibility toggle (for keypoints) -->
                        <div v-if="annotationStore.selectedAnnotation.type === 'keypoint'">
                            <label class="block text-xs text-gray-400 mb-1">Visibility</label>
                            <div class="flex items-center">
                                <input id="visible" v-model="keypointVisible" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-600 text-brand-purple focus:ring-brand-purple"
                                    @change="updateKeypointVisibility" />
                                <label for="visible" class="ml-2 text-white text-sm">Visible</label>
                            </div>
                        </div>

                        <!-- Dimensions (for bbox) -->
                        <div v-if="annotationStore.selectedAnnotation.type === 'bbox'">
                            <label class="block text-xs text-gray-400 mb-1">Dimensions</label>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs text-gray-500">Width</label>
                                    <input v-model.number="bboxWidth" type="number"
                                        class="w-full bg-gray-700 border border-gray-600 rounded-md text-white py-1 px-2 text-sm"
                                        @change="updateBboxDimensions" />
                                </div>
                                <div>
                                    <label class="block text-xs text-gray-500">Height</label>
                                    <input v-model.number="bboxHeight" type="number"
                                        class="w-full bg-gray-700 border border-gray-600 rounded-md text-white py-1 px-2 text-sm"
                                        @change="updateBboxDimensions" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thêm notification -->
                <Notification :message="notification.message" :type="notification.type" :visible="notification.visible"
                    @close="notification.visible = false" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useImageStore } from '@/stores/image';
import { useProjectStore } from '@/stores/project';
import { useAnnotationStore } from '@/stores/annotation';
import Button from '@/components/common/Button.vue';
import AnnotationCanvas from '@/components/annotation/AnnotationCanvas.vue';
import EnhancedDrawingTools from '@/components/annotation/EnhancedDrawingTools.vue';
import ClassSelector from '@/components/annotation/ClassSelector.vue';
import AnnotationList from '@/components/annotation/AnnotationList.vue';
import type { DrawingTool } from '@/types/annotation';
import { useAnnotationShortcuts } from '@/composables/useAnnotationShortcuts';
import Notification from '@/components/common/Notification.vue';
import { UndoIcon, RedoIcon } from '@/components/annotation/icons';

// Router and route
const router = useRouter();
const route = useRoute();

// Stores
const imageStore = useImageStore();
const projectStore = useProjectStore();
const annotationStore = useAnnotationStore();

// Get project ID from route
const projectId = computed(() => Number(route.params.projectId));

// Get project type
const projectType = computed(() => {
    return projectStore.activeProject?.type || 'object_detection';
});

// Current image state
const currentImageId = ref<number | null>(null);

const notification = reactive({
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    visible: false
});

// Tool settings
const toolSettings = ref<any>({
    brush: {
        size: 10
    },
    eraser: {
        size: 10
    },
    magic_wand: {
        tolerance: 30,
        contiguous: true
    }
});

// Properties for selected annotation
const selectedAnnotationClass = ref<number | null>(null);
const keypointVisible = ref(true);
const bboxWidth = ref(0);
const bboxHeight = ref(0);

// Khởi tạo phím tắt
const { keyMap } = useAnnotationShortcuts(
    setTool,
    {},
    {
        onUndo: () => {
            if (annotationStore.canUndo) {
                annotationStore.undo();
                showNotification('Undo action', 'info');
            }
        },
        onRedo: () => {
            if (annotationStore.canRedo) {
                annotationStore.redo();
                showNotification('Redo action', 'info');
            }
        }
    }
);

// Image navigation
const currentImageIndex = computed(() => {
    if (!currentImageId.value) return -1;
    return imageStore.images.findIndex(img => img.id === currentImageId.value);
});

const hasPrevImage = computed(() => {
    return currentImageIndex.value > 0;
});

const hasNextImage = computed(() => {
    return currentImageIndex.value < imageStore.images.length - 1;
});

const currentImage = computed(() => {
    if (!currentImageId.value) return null;
    return imageStore.images.find(img => img.id === currentImageId.value) || null;
});

// Lifecycle hooks
onMounted(async () => {
    if (projectId.value) {
        await Promise.all([
            // Fetch project details if not loaded
            projectStore.activeProject || projectStore.fetchProjectById(projectId.value),
            // Fetch images
            imageStore.fetchProjectImages(projectId.value)
        ]);

        // Set the first image as current if available
        if (imageStore.images.length > 0) {
            currentImageId.value = imageStore.images[0].id;
        }
    }
});

onBeforeUnmount(() => {
    // Reset annotation store state when leaving the page
    annotationStore.resetState();
});

// Watch for changes in current image
watch(currentImageId, async (newId) => {
    if (newId) {
        // Fetch annotations for the new image
        await annotationStore.fetchAnnotations(newId);
    }
});

// Watch for changes in selected annotation
watch(() => annotationStore.selectedAnnotation, (annotation) => {
    if (annotation) {
        selectedAnnotationClass.value = annotation.classId;

        if (annotation.type === 'keypoint') {
            keypointVisible.value = annotation.coordinates[0]?.visible || true;
        } else if (annotation.type === 'bbox') {
            bboxWidth.value = annotation.coordinates.width;
            bboxHeight.value = annotation.coordinates.height;
        }
    } else {
        selectedAnnotationClass.value = null;
    }
});

// Methods
function goToUpload() {
    router.push({
        name: 'project-upload',
        params: { projectId: projectId.value }
    });
}

function goToPrevImage() {
    if (hasPrevImage.value) {
        const newIndex = currentImageIndex.value - 1;
        currentImageId.value = imageStore.images[newIndex].id;
    }
}

function goToNextImage() {
    if (hasNextImage.value) {
        const newIndex = currentImageIndex.value + 1;
        currentImageId.value = imageStore.images[newIndex].id;
    }
}

function setTool(tool: DrawingTool | null) {
    if (tool) {
        // Chỉ thiết lập công cụ khi có lớp được chọn hoặc đó là công cụ điều hướng
        if (annotationStore.selectedClass || ['select', 'move', 'zoom', 'pan'].includes(tool)) {
            // Cập nhật UI của công cụ vẽ
            onToolChange(tool);
        } else if (!['select', 'move', 'zoom', 'pan'].includes(tool)) {
            // Thông báo nếu chưa chọn lớp
            alert('Please select a class first');
        }
    } else {
        // Hủy vẽ hiện tại
        annotationStore.cancelDrawing();
        annotationStore.setCurrentTool(null);
    }
}

function onToolChange(tool: DrawingTool) {
    console.log('Tool changed to:', tool);
    // Các công cụ chú thích
    if (['bbox', 'polygon', 'brush', 'eraser', 'magic_wand', 'keypoint', 'skeleton', 'classification'].includes(tool)) {
        if (annotationStore.selectedClass) {
            // Hiển thị thông báo
            showNotification(`Using ${getToolLabel(tool)} tool with ${annotationStore.selectedClass.name} class`, 'info');

            // Thiết lập công cụ trong annotation store
            annotationStore.setCurrentTool(tool as any);
        } else {
            alert('Please select a class first');
            return;
        }
    } else {
        // Các công cụ điều hướng
        annotationStore.setCurrentTool(null);
        showNotification(`Switched to ${getToolLabel(tool)} tool`, 'info');
    }
}

function onToolSettingsChange(settings: any) {
    console.log('Tool settings changed:', settings);

    if (settings.type) {
        toolSettings.value[settings.type] = { ...settings };
    }
}

function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    notification.message = message;
    notification.type = type;
    notification.visible = true;
}

function getToolLabel(tool: string): string {
    const toolLabels: Record<string, string> = {
        'select': 'Selection',
        'move': 'Move',
        'zoom': 'Zoom',
        'pan': 'Pan',
        'bbox': 'Bounding Box',
        'polygon': 'Polygon',
        'brush': 'Brush',
        'eraser': 'Eraser',
        'magic_wand': 'Magic Wand',
        'keypoint': 'Keypoint',
        'skeleton': 'Skeleton',
        'classification': 'Classification'
    };

    return toolLabels[tool] || tool;
}

function formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Phương thức cập nhật thuộc tính chú thích
async function updateAnnotationClass() {
    if (!annotationStore.selectedAnnotation || !selectedAnnotationClass.value) return;

    try {
        await annotationStore.updateAnnotation(
            annotationStore.selectedAnnotation.id as number,
            { classId: selectedAnnotationClass.value }
        );
    } catch (error) {
        console.error('Failed to update annotation class:', error);
        // Khôi phục giá trị trước đó
        selectedAnnotationClass.value = annotationStore.selectedAnnotation.classId;
    }
}

async function updateKeypointVisibility() {
    if (!annotationStore.selectedAnnotation) return;

    try {
        const annotation = annotationStore.selectedAnnotation;
        if (annotation.type === 'keypoint') {
            const updatedCoordinates = [...annotation.coordinates];
            updatedCoordinates[0].visible = keypointVisible.value;

            await annotationStore.updateAnnotation(
                annotation.id as number,
                {
                    coordinates: updatedCoordinates
                } as any
            );
        }
    } catch (error) {
        console.error('Failed to update keypoint visibility:', error);
        // Khôi phục giá trị trước đó
        keypointVisible.value = !keypointVisible.value;
    }
}

async function updateBboxDimensions() {
    if (!annotationStore.selectedAnnotation) return;

    try {
        const annotation = annotationStore.selectedAnnotation;
        if (annotation.type === 'bbox') {
            const coords = { ...annotation.coordinates };

            // Không cho phép chiều rộng hoặc chiều cao nhỏ hơn 5px
            if (bboxWidth.value < 5) bboxWidth.value = 5;
            if (bboxHeight.value < 5) bboxHeight.value = 5;

            // Cập nhật kích thước
            coords.width = bboxWidth.value;
            coords.height = bboxHeight.value;

            await annotationStore.updateAnnotation(
                annotation.id as number,
                {
                    coordinates: coords
                } as any
            );
        }
    } catch (error) {
        console.error('Failed to update bbox dimensions:', error);
        // Khôi phục giá trị trước đó từ annotation
        const ann = annotationStore.selectedAnnotation;
        if (ann && ann.type === 'bbox') {
            bboxWidth.value = ann.coordinates.width;
            bboxHeight.value = ann.coordinates.height;
        }
    }
}
</script>