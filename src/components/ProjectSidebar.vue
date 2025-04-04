<template>
    <nav class="sidebar w-64 h-full flex-shrink-0 p-4 flex flex-col">
        <div class="mb-6 pb-4 border-b border-gray-600">
            <div v-if="projectStore.isLoadingCurrent" class="text-sm text-sidebar-text">Loading...</div>
            <div v-else-if="project" class="space-y-1">
                <h2 class="text-lg font-semibold text-white truncate" :title="project.name">{{ project.name }}</h2>
                <p class="text-xs text-sidebar-text capitalize">{{ formatProjectType(project.type) }} Project</p>
            </div>
            <div v-else class="text-sm text-red-400">Error loading project info.</div>
        </div>

        <div class="space-y-2 flex-grow">
            <router-link :to="{ name: 'project-upload', params: { projectId: props.projectId } }" class="sidebar-link"
                active-class="active">
                <span class="ml-2">Upload Data</span>
            </router-link>
            <router-link :to="{ name: 'project-annotate', params: { projectId: props.projectId } }" class="sidebar-link"
                active-class="active">
                <span class="ml-2">Annotate</span>
            </router-link>
            <router-link :to="{ name: 'project-dataset', params: { projectId: props.projectId } }" class="sidebar-link"
                active-class="active">
                <span class="ml-2">Dataset</span>
            </router-link>
        </div>

        <div class="mt-auto border-t border-gray-600 pt-4">
            <router-link :to="{ name: 'projects' }" class="sidebar-link text-sm">
                &larr; Back to Projects
            </router-link>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useProjectStore } from '@/stores/project';

// Accept projectId as a prop
const props = defineProps<{
    projectId: number | string;
}>();

const projectStore = useProjectStore();

// Get the active project details from the store
const project = computed(() => projectStore.activeProject);

// Helper function
const formatProjectType = (type: string | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

</script>

<style scoped>
.sidebar {
    overflow-y: auto;
}
</style>