<template>
    <div>
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard v-for="project in projects" :key="project.project_id" :project="project"
                @edit="$emit('edit', project)" @delete="$emit('delete', project.project_id)" />
        </div>

        <div v-else class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
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
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { ProjectDb } from '@/types/express/index';
import ProjectCard from './ProjectCard.vue';

const props = defineProps<{
    projects: ProjectDb[];
}>();

const emit = defineEmits(['create', 'edit', 'delete']);
</script>