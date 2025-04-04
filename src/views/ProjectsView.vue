<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">My Projects</h1>
            <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
                {{ showCreateForm ? 'Cancel Create' : '+ New Project' }}
            </button>
        </div>

        <div v-if="showCreateForm" class="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
            <h2 class="text-xl font-semibold mb-4">New Project Details</h2>
            <div v-if="createError"
                class="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center"> {{
                    createError }} </div>
            <form @submit.prevent="handleCreateProject" class="space-y-4">
                <div>
                    <label for="projectName" class="block text-sm font-medium text-gray-700">Project Name</label>
                    <input type="text" id="projectName" v-model="newProject.name" required
                        class="mt-1 block w-full input-field" />
                </div>
                <div>
                    <label for="projectDesc" class="block text-sm font-medium text-gray-700">Description
                        (Optional)</label>
                    <textarea id="projectDesc" v-model="newProject.description" rows="3"
                        class="mt-1 block w-full input-field"></textarea>
                </div>
                <div>
                    <label for="projectType" class="block text-sm font-medium text-gray-700">Project Type</label>
                    <select id="projectType" v-model="newProject.type" required class="mt-1 block w-full input-field">
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

        <div v-if="projectStore.isLoading && projects.length === 0 && !projectStore.projectError"
            class="text-center py-10">
            <p class="text-gray-500">Loading projects...</p>
        </div>

        <div v-else-if="projectStore.projectError && projects.length === 0"
            class="rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700">
            <p>Error loading projects: {{ projectStore.projectError }}</p>
        </div>

        <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="project in projects" :key="project.project_id"
                class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                <div class="p-5">
                    <h3 class="text-lg font-semibold text-gray-800 mb-1 truncate">{{ project.name }}</h3>
                    <p class="text-sm text-gray-500 mb-3 capitalize">{{ formatProjectType(project.type) }}</p>
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                        {{ project.description || 'No description provided.' }}
                    </p>
                </div>
                <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end items-center space-x-2">
                    <button @click="openEditModal(project)"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <span class="text-gray-300">|</span>
                    <button @click="confirmDeleteProject(project.project_id, project.name)"
                        class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    <router-link :to="{ name: 'home' }" class="btn btn-outline text-sm py-1 px-3 ml-auto"> Open
                    </router-link>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-gray-500">You don't have any projects yet.</p>
            <button @click="showCreateForm = true" class="btn btn-primary mt-4">
                Create Your First Project
            </button>
        </div>

        <ModalComponent v-model="showEditModal" @confirm="handleUpdateProject">
            <template #header>Edit Project</template>
            <template #body>
                <div v-if="editError"
                    class="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
                    {{ editError }}
                </div>
                <form id="editProjectForm" @submit.prevent="handleUpdateProject" class="space-y-4">
                    <div>
                        <label for="editProjectName" class="block text-sm font-medium text-gray-700">Project
                            Name</label>
                        <input type="text" id="editProjectName" v-model="editingProject.name" required
                            class="mt-1 block w-full input-field" />
                    </div>
                    <div>
                        <label for="editProjectDesc" class="block text-sm font-medium text-gray-700">Description
                            (Optional)</label>
                        <textarea id="editProjectDesc" v-model="editingProject.description" rows="3"
                            class="mt-1 block w-full input-field"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Project Type</label>
                        <p class="mt-1 text-sm text-gray-500 capitalize">{{ formatProjectType(editingProject.type) }}
                        </p>
                    </div>
                </form>
            </template>
            <template #footer>
                <button @click="closeEditModal" class="btn btn-outline">Cancel</button>
                <button type="submit" form="editProjectForm" :disabled="projectStore.isLoading" class="btn btn-primary"
                    :class="{ 'opacity-50 cursor-not-allowed': projectStore.isLoading }">
                    {{ projectStore.isLoading ? 'Saving...' : 'Save Changes' }}
                </button>
            </template>
        </ModalComponent>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { allowedProjectTypes, type ProjectType } from '@/types/projectTypes';
import type { ProjectDb } from '@/types/express/index.d';
import ModalComponent from '@/components/ModalComponent.vue'; // Import the modal component

const projectStore = useProjectStore();

// State for Create Form
const showCreateForm = ref(false);
const createError = ref<string | null>(null);
const newProject = reactive({ name: '', description: '', type: '' as ProjectType | '' });

// State for Edit Modal
const showEditModal = ref(false);
const editError = ref<string | null>(null);
const editingProject = reactive<Partial<ProjectDb>>({ // Use Partial for editing state
    project_id: undefined,
    name: '',
    description: '',
    type: 'object_detection' // Default or initial type
});

// Computed property to get projects from store
const projects = computed(() => projectStore.projectList);

// Fetch projects when the component is mounted
onMounted(() => {
    projectStore.fetchProjects();
});

// Format project type for display
const formatProjectType = (type: string | undefined) => {
    if (!type) return 'N/A';
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

// --- Edit Project Logic ---
const openEditModal = (project: ProjectDb) => {
    editError.value = null; // Clear previous edit errors
    // Copy project data to editing state
    editingProject.project_id = project.project_id;
    editingProject.name = project.name;
    editingProject.description = project.description;
    editingProject.type = project.type; // Keep type for display
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    // Optionally reset editingProject fields here if needed
};

const handleUpdateProject = async () => {
    editError.value = null; // Clear previous errors
    if (!editingProject.project_id || !editingProject.name) {
        editError.value = "Project Name cannot be empty.";
        return;
    }
    try {
        await projectStore.updateProject(editingProject.project_id, {
            name: editingProject.name,
            description: editingProject.description // Send description (can be null)
        });
        closeEditModal(); // Close modal on success
    } catch (err: any) {
        console.error("Failed to update project:", err);
        editError.value = err.message || "An unexpected error occurred during update.";
        // Keep modal open to show error
    }
};

// --- Delete Project Logic ---
const confirmDeleteProject = async (projectId: number, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
        try {
            await projectStore.deleteProject(projectId);
            // Optionally show a success notification
        } catch (err: any) {
            console.error("Failed to delete project:", err);
            alert(`Error deleting project: ${err.message || 'Unknown error'}`); // Simple alert for error
        }
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

.input-field {
    @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm;
}
</style>