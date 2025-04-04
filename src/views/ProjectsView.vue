<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">My Projects</h1>
            <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
                {{ showCreateForm ? 'Cancel' : 'Create New Project' }}
            </button>
        </div>

        <div v-if="showCreateForm" class="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
            <h2 class="text-xl font-semibold mb-4">New Project Details</h2>
            <div v-if="createError"
                class="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
                {{ createError }}
            </div>
            <form @submit.prevent="handleCreateProject" class="space-y-4">
                <div>
                    <label for="projectName" class="block text-sm font-medium text-gray-700">Project Name</label>
                    <input type="text" id="projectName" v-model="newProject.name" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm" />
                </div>
                <div>
                    <label for="projectDesc" class="block text-sm font-medium text-gray-700">Description
                        (Optional)</label>
                    <textarea id="projectDesc" v-model="newProject.description" rows="3"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm"></textarea>
                </div>
                <div>
                    <label for="projectType" class="block text-sm font-medium text-gray-700">Project Type</label>
                    <select id="projectType" v-model="newProject.type" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm">
                        <option disabled value="">Please select one</option>
                        <option v-for="ptype in allowedProjectTypes" :key="ptype" :value="ptype">{{
                            formatProjectType(ptype) }}</option>
                    </select>
                </div>
                <div class="flex justify-end">
                    <button type="submit" :disabled="projectStore.isLoading" class="btn btn-primary"
                        :class="{ 'opacity-50 cursor-not-allowed': projectStore.isLoading }">
                        {{ projectStore.isLoading ? 'Creating...' : 'Create Project' }}
                    </button>
                </div>
            </form>
        </div>

        <div v-if="projectStore.isLoading && !showCreateForm" class="text-center py-10">
            <p class="text-gray-500">Loading projects...</p>
        </div>

        <div v-else-if="projectStore.projectError"
            class="rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700">
            <p>Error loading projects: {{ projectStore.projectError }}</p>
        </div>

        <div v-else-if="projectStore.projectList.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="project in projectStore.projectList" :key="project.project_id"
                class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div class="p-5">
                    <h3 class="text-lg font-semibold text-gray-800 mb-1 truncate">{{ project.name }}</h3>
                    <p class="text-sm text-gray-500 mb-3 capitalize">{{ formatProjectType(project.type) }}</p>
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                        {{ project.description || 'No description provided.' }}
                    </p>
                    <div class="flex justify-end">
                        <router-link :to="{ name: 'home' }" class="btn btn-outline text-sm py-1 px-3"> Open Project
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-gray-500">You don't have any projects yet.</p>
            <button @click="showCreateForm = true" class="btn btn-primary mt-4">
                Create Your First Project
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useProjectStore } from '@/stores/project'
import { allowedProjectTypes, type ProjectType } from '@/types/projectTypes'; // Import types/constants

const projectStore = useProjectStore();

const showCreateForm = ref(false);
const createError = ref<string | null>(null);
const newProject = reactive({
    name: '',
    description: '',
    type: '' as ProjectType | '' // Initialize type for select binding
});

// Fetch projects when the component is mounted
onMounted(() => {
    projectStore.fetchProjects();
});

// Format project type for display
const formatProjectType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Handle create project form submission
const handleCreateProject = async () => {
    createError.value = null; // Clear previous errors
    if (!newProject.name || !newProject.type) {
        createError.value = "Project Name and Type are required.";
        return;
    }
    try {
        const created = await projectStore.createProject({
            name: newProject.name,
            description: newProject.description || null,
            type: newProject.type as ProjectType // Cast because we validated it's not ''
        });
        if (created) {
            // Reset form and hide it
            newProject.name = '';
            newProject.description = '';
            newProject.type = '';
            showCreateForm.value = false;
            // Optionally navigate to the new project page later
        }
    } catch (err: any) {
        console.error("Failed to create project:", err);
        createError.value = err.message || "An unexpected error occurred.";
    }
};

</script>

<style scoped>
/* Add specific styles if needed */
.line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
</style>