<template>
    <div class="p-4 bg-gray-800 rounded-lg">
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-white text-sm font-medium">Classes</h3>
            <button @click="showAddClassForm = true"
                class="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                title="Add new class">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>

        <!-- Class list -->
        <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <div v-for="cls in classes" :key="cls.id"
                class="w-full flex items-center p-2 rounded transition-colors group" :class="[
                    selectedClassId === cls.id
                        ? 'bg-gray-700 ring-2 ring-brand-purple'
                        : 'hover:bg-gray-700'
                ]" :style="{ borderLeftColor: cls.color, borderLeftWidth: '4px' }">

                <!-- Class info - clickable to select -->
                <div @click="selectClass(cls.id)" class="flex items-center flex-1 cursor-pointer">
                    <span class="w-4 h-4 rounded-full inline-block flex-shrink-0"
                        :style="{ backgroundColor: cls.color }"></span>
                    <span class="ml-2 text-white text-sm truncate">{{ cls.name }}</span>
                </div>

                <!-- Action buttons - visible on hover -->
                <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="startEditClass(cls)"
                        class="p-1 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-600 transition-colors"
                        title="Edit class">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button @click="confirmDeleteClass(cls)"
                        class="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-600 transition-colors"
                        title="Delete class">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="classes.length === 0" class="text-center py-4 text-gray-400 italic text-sm">
            No classes defined for this project
        </div>

        <!-- Add/Edit class form -->
        <div v-if="showAddClassForm || editingClass" class="mt-4 p-3 bg-gray-700 rounded-md">
            <h4 class="text-white text-sm font-medium mb-2">
                {{ editingClass ? 'Edit Class' : 'New Class' }}
            </h4>

            <div class="mb-3">
                <label for="className" class="block text-xs text-gray-300 mb-1">Name</label>
                <input id="className" v-model="classForm.name" type="text"
                    class="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Enter class name" />
            </div>

            <div class="mb-4">
                <label for="classColor" class="block text-xs text-gray-300 mb-1">Color</label>
                <div class="flex items-center space-x-2">
                    <input id="classColor" v-model="classForm.color" type="color"
                        class="w-10 h-10 rounded cursor-pointer bg-transparent" />
                    <input v-model="classForm.color" type="text"
                        class="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        placeholder="#RRGGBB" />
                </div>
            </div>

            <div class="flex justify-end space-x-2">
                <button @click="cancelForm"
                    class="px-3 py-1.5 rounded-md bg-gray-600 text-white text-sm hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
                <button @click="editingClass ? updateClass() : createClass()"
                    class="px-3 py-1.5 rounded-md bg-brand-purple text-white text-sm hover:bg-brand-purple-dark transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': isLoading }" :disabled="isLoading || !classForm.name">
                    {{ isLoading ? (editingClass ? 'Updating...' : 'Creating...') : (editingClass ? 'Update' : 'Create')
                    }}
                </button>
            </div>
        </div>

        <!-- Delete confirmation modal -->
        <Modal v-model="showDeleteConfirm" title="Delete Class" size="sm">
            <p class="text-gray-700 mb-4">
                Are you sure you want to delete the class <strong>{{ classToDelete?.name }}</strong>?
                This will also delete all annotations using this class.
            </p>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <Button @click="showDeleteConfirm = false" variant="outline">
                        Cancel
                    </Button>
                    <Button @click="executeDeleteClass" variant="danger" :loading="isDeleting"
                        loading-text="Deleting...">
                        Delete Class
                    </Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import classService from '@/services/classService';
import Modal from '@/components/common/Modal.vue';
import Button from '@/components/common/Button.vue';
import type { ClassResponseDTO, ClassCreateDTO, ClassUpdateDTO } from '@/types/class';

const props = defineProps<{
    projectId: number;
}>();

// Store
const annotationStore = useAnnotationStore();

// Local state
const showAddClassForm = ref(false);
const editingClass = ref<ClassResponseDTO | null>(null);
const showDeleteConfirm = ref(false);
const classToDelete = ref<ClassResponseDTO | null>(null);
const isLoading = ref(false);
const isDeleting = ref(false);

// Form data
const classForm = reactive({
    name: '',
    color: generateRandomColor()
});

// Classes from store
const classes = computed(() => annotationStore.classes);
const selectedClassId = computed(() => annotationStore.selectedClassId);

// Fetch classes on mount
onMounted(async () => {
    await annotationStore.fetchClasses(props.projectId);
});

// Methods
function selectClass(classId: number) {
    annotationStore.selectClass(classId);
}

async function createClass() {
    if (!classForm.name) return;

    isLoading.value = true;

    try {
        await classService.createClass(props.projectId, {
            name: classForm.name,
            color: classForm.color
        });

        // Refresh classes
        await annotationStore.fetchClasses(props.projectId);

        // Reset form
        resetForm();
        showAddClassForm.value = false;
    } catch (error) {
        console.error('Failed to create class:', error);
        alert('Failed to create class. Please try again.');
    } finally {
        isLoading.value = false;
    }
}

function startEditClass(cls: ClassResponseDTO) {
    editingClass.value = cls;
    classForm.name = cls.name;
    classForm.color = cls.color;
    showAddClassForm.value = false; // Hide add form if open
}

async function updateClass() {
    if (!editingClass.value || !classForm.name) return;

    isLoading.value = true;

    try {
        const updateData: ClassUpdateDTO = {
            name: classForm.name,
            color: classForm.color
        };

        await classService.updateClass(editingClass.value.id, updateData);

        // Refresh classes
        await annotationStore.fetchClasses(props.projectId);

        // Reset form
        resetForm();
        editingClass.value = null;
    } catch (error) {
        console.error('Failed to update class:', error);
        alert('Failed to update class. Please try again.');
    } finally {
        isLoading.value = false;
    }
}

function confirmDeleteClass(cls: ClassResponseDTO) {
    classToDelete.value = cls;
    showDeleteConfirm.value = true;
}

async function executeDeleteClass() {
    if (!classToDelete.value) return;

    isDeleting.value = true;

    try {
        await classService.deleteClass(classToDelete.value.id);

        // If we deleted the selected class, clear selection
        if (selectedClassId.value === classToDelete.value.id) {
            annotationStore.selectClass(0); // Will be handled to select first available
        }

        // Refresh classes
        await annotationStore.fetchClasses(props.projectId);

        // Close modal
        showDeleteConfirm.value = false;
        classToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete class:', error);
        alert('Failed to delete class. Please try again.');
    } finally {
        isDeleting.value = false;
    }
}

function cancelForm() {
    resetForm();
    showAddClassForm.value = false;
    editingClass.value = null;
}

function resetForm() {
    classForm.name = '';
    classForm.color = generateRandomColor();
}

// Generate a random color for new classes
function generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
</script>

<style scoped>
/* Custom scrollbar for the class list */
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

/* Hide action buttons by default, show on hover */
.group:not(:hover) .opacity-0 {
    opacity: 0;
}
</style>