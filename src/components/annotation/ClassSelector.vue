<template>
    <div class="p-4 bg-gray-800 rounded-lg">
        <h3 class="text-white text-sm font-medium mb-2">Classes</h3>

        <!-- Class list -->
        <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
            <button v-for="cls in classes" :key="cls.id" @click="selectClass(cls.id)"
                class="w-full flex items-center p-2 rounded transition-colors" :class="[
                    selectedClassId === cls.id
                        ? 'bg-gray-700 ring-2 ring-brand-purple'
                        : 'hover:bg-gray-700'
                ]" :style="{ borderLeftColor: cls.color, borderLeftWidth: '4px' }">
                <span class="w-4 h-4 rounded-full inline-block flex-shrink-0"
                    :style="{ backgroundColor: cls.color }"></span>
                <span class="ml-2 text-white text-sm truncate">{{ cls.name }}</span>
            </button>
        </div>

        <!-- Empty state -->
        <div v-if="classes.length === 0" class="text-center py-4 text-gray-400 italic text-sm">
            No classes defined for this project
        </div>

        <!-- Add class button -->
        <button @click="showAddClassForm = true"
            class="mt-3 w-full flex items-center justify-center py-2 px-3 rounded-md bg-gray-700 text-white text-sm hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Class
        </button>

        <!-- Add class form -->
        <div v-if="showAddClassForm" class="mt-4 p-3 bg-gray-700 rounded-md">
            <h4 class="text-white text-sm font-medium mb-2">New Class</h4>

            <div class="mb-3">
                <label for="className" class="block text-xs text-gray-300 mb-1">Name</label>
                <input id="className" v-model="newClass.name" type="text"
                    class="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Enter class name" />
            </div>

            <div class="mb-4">
                <label for="classColor" class="block text-xs text-gray-300 mb-1">Color</label>
                <div class="flex items-center space-x-2">
                    <input id="classColor" v-model="newClass.color" type="color"
                        class="w-10 h-10 rounded cursor-pointer bg-transparent" />
                    <input v-model="newClass.color" type="text"
                        class="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        placeholder="#RRGGBB" />
                </div>
            </div>

            <div class="flex justify-end space-x-2">
                <button @click="showAddClassForm = false"
                    class="px-3 py-1.5 rounded-md bg-gray-600 text-white text-sm hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
                <button @click="createClass"
                    class="px-3 py-1.5 rounded-md bg-brand-purple text-white text-sm hover:bg-brand-purple-dark transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': isAddingClass }"
                    :disabled="isAddingClass || !newClass.name">
                    {{ isAddingClass ? 'Creating...' : 'Create' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import axios from 'axios';
import classService from '@/services/classService';

const props = defineProps<{
    projectId: number;
}>();

// Store
const annotationStore = useAnnotationStore();

// Local state
const showAddClassForm = ref(false);
const isAddingClass = ref(false);
const newClass = ref({
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
    if (!newClass.value.name) return;

    isAddingClass.value = true;

    try {
        // Call class service instead of direct axios call
        await classService.createClass(props.projectId, {
            name: newClass.value.name,
            color: newClass.value.color
        });

        // Refresh classes
        await annotationStore.fetchClasses(props.projectId);

        // Reset form
        newClass.value = {
            name: '',
            color: generateRandomColor()
        };

        showAddClassForm.value = false;
    } catch (error) {
        console.error('Failed to create class:', error);
        alert('Failed to create class. Please try again.');
    } finally {
        isAddingClass.value = false;
    }
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
</style>