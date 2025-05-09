<template>
    <div class="p-3 bg-gray-800 rounded-lg space-y-3">
        <h3 class="text-white text-sm font-medium mb-3">Drawing Tools</h3>

        <!-- Undo/Redo buttons -->
        <div class="flex space-x-2 mb-2">
            <button @click="handleUndo" class="tool-btn px-2" :class="{ 'opacity-40 cursor-not-allowed': !canUndo }"
                :disabled="!canUndo" title="Undo (Ctrl+Z)">
                <UndoIcon class="h-5 w-5" />
            </button>

            <button @click="handleRedo" class="tool-btn px-2" :class="{ 'opacity-40 cursor-not-allowed': !canRedo }"
                :disabled="!canRedo" title="Redo (Ctrl+Y)">
                <RedoIcon class="h-5 w-5" />
            </button>
        </div>

        <!-- Công cụ vẽ theo nhóm -->
        <div class="space-y-4">
            <!-- Nhóm di chuyển/chọn -->
            <div>
                <div class="text-xs text-gray-400 mb-2">Navigation</div>
                <div class="flex flex-wrap gap-2">
                    <button v-for="tool in navigationTools" :key="tool" @click="selectTool(tool)" class="tool-btn"
                        :class="{ active: currentTool === tool }" :title="getToolInfo(tool).label">
                        <component :is="getIconComponent(tool)" class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <!-- Nhóm chú thích -->
            <div v-if="annotationTools.length > 0">
                <div class="text-xs text-gray-400 mb-2">Annotation</div>
                <div class="flex flex-wrap gap-2">
                    <button v-for="tool in annotationTools" :key="tool" @click="selectTool(tool)" class="tool-btn"
                        :class="{ active: currentTool === tool }" :title="getToolInfo(tool).label">
                        <component :is="getIconComponent(tool)" class="h-5 w-5" />
                        <span class="ml-1 hidden sm:inline-block">{{ getToolInfo(tool).label }}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Các thiết lập công cụ -->
        <div v-if="showToolSettings" class="mt-4 p-3 bg-gray-700 rounded-md">
            <!-- Thiết lập cho Brush -->
            <div v-if="currentTool === 'brush' || currentTool === 'eraser'">
                <h4 class="text-white text-sm font-medium mb-2">Brush Settings</h4>
                <div class="flex items-center space-x-2">
                    <span class="text-gray-300 text-xs">Size:</span>
                    <input v-model.number="brushSize" type="range" min="1" max="50" class="w-full"
                        @change="updateBrushSettings" />
                    <span class="text-gray-300 text-xs w-8 text-right">{{ brushSize }}px</span>
                </div>
            </div>

            <!-- Thiết lập cho Magic Wand -->
            <div v-if="currentTool === 'magic_wand'">
                <h4 class="text-white text-sm font-medium mb-2">Magic Wand Settings</h4>
                <div class="flex items-center space-x-2 mb-2">
                    <span class="text-gray-300 text-xs">Tolerance:</span>
                    <input v-model.number="magicWandTolerance" type="range" min="1" max="100" class="w-full"
                        @change="updateMagicWandSettings" />
                    <span class="text-gray-300 text-xs w-8 text-right">{{ magicWandTolerance }}%</span>
                </div>
                <div class="flex items-center">
                    <input id="contiguous" v-model="magicWandContiguous" type="checkbox"
                        class="h-4 w-4 rounded border-gray-300" @change="updateMagicWandSettings" />
                    <label for="contiguous" class="ml-2 text-gray-300 text-xs">Contiguous</label>
                </div>
            </div>
        </div>

        <!-- Hiển thị lớp đã chọn -->
        <div v-if="selectedClass" class="mt-3 p-2 rounded-md border border-gray-700"
            :style="{ backgroundColor: `${selectedClass.color}22` }">
            <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full inline-block"
                    :style="{ backgroundColor: selectedClass.color }"></span>
                <span class="text-white text-sm">{{ selectedClass.name }}</span>
            </div>
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="mt-4 text-xs text-gray-400">
            <button @click="showShortcuts = !showShortcuts" class="flex items-center text-gray-400 hover:text-white">
                <span v-if="showShortcuts">▼</span>
                <span v-else>▶</span>
                <span class="ml-1">Keyboard Shortcuts</span>
            </button>

            <div v-if="showShortcuts" class="mt-2 space-y-1 pl-2">
                <div v-for="(tool, key) in keyboardShortcuts" :key="key" class="flex justify-between">
                    <span class="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{{ key }}</span>
                    <span>{{ getTool(tool) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Ctrl+Z</span>
                    <span>Undo</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Ctrl+Y</span>
                    <span>Redo</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import type { DrawingTool } from '@/types/annotation';
import { getDrawingToolsForProjectType, getToolInfo } from '@/utils/drawingToolMapper';
import * as Icons from './icons';
import { UndoIcon, RedoIcon } from './icons';

const props = defineProps<{
    projectType: string;
}>();

const emit = defineEmits<{
    (e: 'tool-change', tool: DrawingTool): void;
    (e: 'settings-change', settings: any): void;
}>();

// Store
const annotationStore = useAnnotationStore();

// Các thiết lập công cụ
const brushSize = ref(10);
const magicWandTolerance = ref(30);
const magicWandContiguous = ref(true);
const showShortcuts = ref(false);

// Công cụ hiện tại
const currentTool = ref<DrawingTool | null>(null);

// Getters từ store
const canUndo = computed(() => annotationStore.canUndo);
const canRedo = computed(() => annotationStore.canRedo);

// Kiểm tra xem có hiển thị thiết lập công cụ không
const showToolSettings = computed(() => {
    return ['brush', 'eraser', 'magic_wand'].includes(currentTool.value as string);
});

// Lớp đã chọn
const selectedClass = computed(() => {
    return annotationStore.selectedClass;
});

// Chia các công cụ thành các nhóm
const availableTools = computed(() => {
    return getDrawingToolsForProjectType(props.projectType as any);
});

const navigationTools = computed(() => {
    return availableTools.value.filter(tool =>
        ['select', 'move', 'zoom', 'pan'].includes(tool)
    );
});

const annotationTools = computed(() => {
    return availableTools.value.filter(tool =>
        !['select', 'move', 'zoom', 'pan'].includes(tool)
    );
});

// Xử lý phím tắt
const handleKeyDown = (event: KeyboardEvent) => {
    // Bỏ qua nếu đang focus vào ô nhập liệu
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
        return;
    }

    // Undo - Ctrl+Z
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
        return;
    }

    // Redo - Ctrl+Y hoặc Ctrl+Shift+Z
    if ((event.ctrlKey && event.key === 'y') ||
        (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        handleRedo();
        return;
    }
};

// Phím tắt
const keyboardShortcuts = computed(() => {
    const shortcuts: Record<string, string> = {
        'v': 'select',
        'b': 'bbox',
        'p': 'polygon',
        'r': 'brush',
        'e': 'eraser',
        'w': 'magic_wand',
        'k': 'keypoint',
        's': 'skeleton',
        'c': 'classification',
        'm': 'move'
    };

    return shortcuts;
});

// Phương thức
function selectTool(tool: DrawingTool) {
    if (!selectedClass.value && !['select', 'move', 'zoom', 'pan'].includes(tool)) {
        alert('Please select a class first');
        return;
    }

    currentTool.value = tool;

    // Cập nhật tool trong annotation store
    if (['bbox', 'polygon', 'brush', 'eraser', 'magic_wand', 'keypoint', 'skeleton', 'classification'].includes(tool)) {
        annotationStore.setCurrentTool(tool as any);
    } else {
        // Các công cụ điều hướng sẽ reset công cụ vẽ hiện tại
        annotationStore.setCurrentTool(null);
    }

    emit('tool-change', tool);
}

function handleUndo() {
    if (canUndo.value) {
        annotationStore.undo();
    }
}

function handleRedo() {
    if (canRedo.value) {
        annotationStore.redo();
    }
}

function getIconComponent(tool: string) {
    switch (tool) {
        case 'select': return Icons.CursorIcon;
        case 'move': return Icons.MoveIcon;
        case 'zoom': return Icons.ZoomIcon;
        case 'pan': return Icons.PanIcon;
        case 'bbox': return Icons.BboxIcon;
        case 'polygon': return Icons.PolygonIcon;
        case 'brush': return Icons.BrushIcon;
        case 'eraser': return Icons.EraserIcon;
        case 'magic_wand': return Icons.MagicWandIcon;
        case 'keypoint': return Icons.KeypointIcon;
        case 'skeleton': return Icons.SkeletonIcon;
        case 'classification': return Icons.ClassificationIcon;
        default: return Icons.CursorIcon;
    }
}

function updateBrushSettings() {
    emit('settings-change', {
        type: currentTool.value,
        size: brushSize.value
    });
}

function updateMagicWandSettings() {
    emit('settings-change', {
        type: 'magic_wand',
        tolerance: magicWandTolerance.value,
        contiguous: magicWandContiguous.value
    });
}

function getTool(tool: string | null): string {
    if (!tool) return 'Cancel Drawing';

    return getToolInfo(tool as any).label;
}

// Theo dõi thay đổi công cụ trong annotation store
watch(() => annotationStore.drawingState.currentTool, (newTool) => {
    if (newTool) {
        currentTool.value = newTool as DrawingTool;
    }
});

// Khởi tạo event listeners
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Thêm vào phần <style> */
.tool-btn {
    @apply flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded-md text-sm transition-colors relative;
}

.tool-btn:hover:not(:disabled) {
    @apply bg-gray-600 text-white;
}

.tool-btn.active {
    @apply bg-brand-purple text-white;
}

.tool-btn:disabled {
    @apply opacity-40 cursor-not-allowed;
}

/* Tooltip styling */
.tool-btn[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #374151;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    margin-bottom: 0.25rem;
    z-index: 10;
    pointer-events: none;
}

/* Styling for range input */
input[type="range"] {
    @apply h-2 bg-gray-600 rounded-full appearance-none;
}

input[type="range"]::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 rounded-full bg-brand-purple cursor-pointer;
}

input[type="checkbox"] {
    @apply rounded border-gray-600 text-brand-purple focus:ring-brand-purple;
}
</style>