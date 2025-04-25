<template>
    <div class="flex h-screen overflow-hidden bg-gray-50">
        <ProjectSidebar v-if="projectId" :project-id="projectId" class="w-64 fixed top-0 left-0 bottom-0 z-50" />

        <div class="flex-1 ml-64 p-6 overflow-y-auto">
            <div v-if="projectStore.isLoadingCurrent && !projectStore.activeProject"
                class="text-center p-10 text-gray-500">Loading project details...</div>
            <div v-else-if="projectStore.projectError && !projectStore.activeProject"
                class="text-center p-10 text-red-600">Error loading project: {{ projectStore.projectError }}</div>

            <router-view v-else></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import ProjectSidebar from '@/components/projects/ProjectSidebar.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

// Get projectId from route params
const projectId = ref(route.params.projectId as string);

const fetchProjectData = async (id: string | number) => {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
        // Fetching data will update projectStore.activeProject
        await projectStore.fetchProjectById(numericId);
        // Check if project fetch resulted in an error and the project is null
        if (projectStore.projectError && !projectStore.activeProject) {
            console.error("Project fetch failed, redirecting...");
            router.replace({ name: 'projects', query: { error: 'Project not found or access denied' } });
        }
    } else {
        console.error("Invalid Project ID:", id);
        // Redirect if ID is invalid
        router.replace({ name: 'projects', query: { error: 'Invalid project ID' } });
    }
};

// Fetch project data when component mounts
onMounted(() => {
    fetchProjectData(projectId.value);
});

// Watch for route param changes
watch(() => route.params.projectId, (newId) => {
    if (newId && newId !== projectId.value) {
        projectId.value = newId as string;
        fetchProjectData(projectId.value);
    }
});

</script>

<style>
:root {
    --header-height: 4.5rem;
}
</style>
