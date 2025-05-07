<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
            <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1">Project Name <span
                    class="text-red-500">*</span></label>
            <input id="projectName" v-model="formData.name" required type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                placeholder="Enter project name" />
        </div>

        <div>
            <label for="projectType" class="block text-sm font-medium text-gray-700 mb-1">Project Type <span
                    class="text-red-500">*</span></label>
            <select id="projectType" v-model="formData.type" required
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent">
                <option value="" disabled>Select project type</option>
                <option v-for="type in projectTypes" :key="type" :value="type">
                    {{ formatProjectType(type) }}
                </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Select the type of computer vision model you want to create</p>
        </div>

        <div>
            <label for="projectDesc" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea id="projectDesc" v-model="formData.description" rows="3"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                placeholder="Enter project description"></textarea>
        </div>

        <div class="flex justify-end pt-2">
            <button type="button" class="btn btn-outline mr-2" @click="$emit('cancel')">
                Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ isEdit ? 'Saving...' : 'Creating...' }}
                </span>
                <span v-else>{{ isEdit ? 'Save Changes' : 'Create Project' }}</span>
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { type ProjectType, allowedProjectTypes } from '@/types/projectTypes';
import type { ProjectDb } from '@/types/express/index';

interface FormData {
    name: string;
    description: string;
    type: ProjectType | '';
}

const props = defineProps<{
    project?: ProjectDb;
    isLoading?: boolean;
    isEdit?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const projectTypes = ref(allowedProjectTypes);
const formData = ref<FormData>({
    name: '',
    description: '',
    type: ''
});

// Initialize form data if editing
onMounted(() => {
    if (props.project) {
        formData.value = {
            name: props.project.name,
            description: props.project.description || '',
            type: props.project.type as ProjectType
        };
    }
});

const formatProjectType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const handleSubmit = () => {
    if (formData.value.name && formData.value.type) {
        emit('submit', {
            ...formData.value,
            // Ensure type is ProjectType
            type: formData.value.type as ProjectType
        });
    }
};
</script>