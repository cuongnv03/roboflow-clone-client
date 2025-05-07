<template>
    <div>
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" @edit="$emit('edit', project)"
                @delete="$emit('delete', project.id)" />
        </div>

        <div v-else-if="!isLoading"
            class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-gray-600 mb-4">You don't have any projects yet</p>
            <button @click="$emit('create')" class="btn btn-primary">
                Create Your First Project
            </button>
        </div>

        <div v-else class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Project } from '@/types/project';
import ProjectCard from './ProjectCard.vue';

const props = defineProps<{
    projects: Project[];
    isLoading: boolean;
}>();

const emit = defineEmits(['create', 'edit', 'delete']);
</script>