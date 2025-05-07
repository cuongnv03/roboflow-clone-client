<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 bg-brand-gray w-64 z-10 shadow-lg">
            <div class="h-full flex flex-col">
                <!-- Project Header -->
                <div class="p-4 border-b border-gray-600">
                    <router-link to="/projects" class="flex items-center mb-4 text-brand-text hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-4 h-4 mr-1">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Projects
                    </router-link>
                    <h1 v-if="projectStore.activeProject" class="text-xl font-bold text-white truncate">
                        {{ projectStore.activeProject.name }}
                    </h1>
                    <div v-else class="animate-pulse h-6 bg-gray-700 rounded w-3/4"></div>

                    <p v-if="projectStore.activeProject" class="text-brand-text text-sm capitalize mt-1">
                        {{ formatProjectType(projectStore.activeProject.type) }} Project
                    </p>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-4 space-y-2">
                    <router-link :to="{ name: 'project-upload', params: { projectId } }" class="sidebar-link"
                        active-class="active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5 mr-2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload Data
                    </router-link>

                    <router-link :to="{ name: 'project-annotate', params: { projectId } }" class="sidebar-link"
                        active-class="active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5 mr-2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                        </svg>
                        Annotate
                    </router-link>

                    <router-link :to="{ name: 'project-dataset', params: { projectId } }" class="sidebar-link"
                        active-class="active">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5 mr-2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                        Datasets
                    </router-link>
                </nav>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="ml-64 flex-1 flex flex-col min-h-screen">
            <main class="flex-1 p-6 bg-gray-50">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

// Get project ID from route params
const projectId = computed(() => route.params.projectId);

// Format project type for display
const formatProjectType = (type: string | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Fetch project data when component mounts or project ID changes
onMounted(() => {
    fetchProjectData();
});

watch(() => route.params.projectId, () => {
    fetchProjectData();
});

const fetchProjectData = async () => {
    if (projectId.value) {
        try {
            await projectStore.fetchProjectById(Number(projectId.value));
            if (!projectStore.activeProject && !projectStore.isLoadingCurrent) {
                router.push('/projects');
            }
        } catch (error) {
            console.error('Failed to load project:', error);
        }
    }
};
</script>

<style scoped>
.sidebar-link {
    @apply flex items-center rounded-md px-3 py-2 text-brand-text text-sm hover:bg-gray-700 hover:text-white transition-colors;
}

.sidebar-link.active {
    @apply bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-medium;
}
</style>