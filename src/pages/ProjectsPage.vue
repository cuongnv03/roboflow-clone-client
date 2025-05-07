<template>
    <DefaultLayout>
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-gray-900">My Projects</h1>
                <Button variant="primary" @click="showCreateProjectForm = !showCreateProjectForm">
                    {{ showCreateProjectForm ? 'Cancel' : '+ New Project' }}
                </Button>
            </div>

            <!-- Create Project Form -->
            <Card v-if="showCreateProjectForm" class="mb-8">
                <template #header>
                    <h2 class="text-xl font-semibold">Create New Project</h2>
                </template>
                <ProjectForm :is-loading="projectStore.isLoading" @submit="handleCreateProject"
                    @cancel="showCreateProjectForm = false" />
            </Card>

            <!-- Error message -->
            <div v-if="projectStore.projectError" class="bg-red-50 border border-red-300 rounded-md p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error loading projects</h3>
                        <p class="mt-1 text-sm text-red-700">{{ projectStore.projectError }}</p>
                        <button @click="fetchProjects" class="mt-2 text-sm text-red-600 underline hover:text-red-800">
                            Try again
                        </button>
                    </div>
                </div>
            </div>

            <!-- Project List -->
            <ProjectsList :projects="projectStore.projects" :is-loading="projectStore.isLoading"
                @create="showCreateProjectForm = true" @edit="openEditModal" @delete="confirmDeleteProject" />
        </div>

        <!-- Edit Project Modal -->
        <Modal v-model="showEditModal" title="Edit Project">
            <ProjectForm v-if="showEditModal" :project="projectToEdit" :is-loading="projectStore.isLoading"
                :is-edit="true" @submit="handleUpdateProject" @cancel="showEditModal = false" />
        </Modal>

        <!-- Delete Confirmation Modal -->
        <Modal v-model="showDeleteModal" title="Delete Project">
            <p class="mb-4 text-gray-600">
                Are you sure you want to delete <strong>{{ projectToDelete?.name }}</strong>?
                This action cannot be undone and all associated data will be permanently removed.
            </p>

            <template #footer>
                <div class="flex justify-end space-x-3">
                    <Button @click="showDeleteModal = false" variant="outline">
                        Cancel
                    </Button>
                    <Button @click="executeDeleteProject" variant="danger" :loading="projectStore.isLoading"
                        loading-text="Deleting...">
                        Delete Project
                    </Button>
                </div>
            </template>
        </Modal>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import type { Project, ProjectType } from '@/types/project';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ProjectsList from '@/components/projects/ProjectsList.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import Modal from '@/components/common/Modal.vue';
import Button from '@/components/common/Button.vue';
import Card from '@/components/common/Card.vue';

// Store
const projectStore = useProjectStore();

// State
const showCreateProjectForm = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const projectToEdit = ref<Project | null>(null);
const projectToDelete = ref<Project | null>(null);

// Lifecycle hooks
onMounted(async () => {
    fetchProjects();
});

// Methods
const fetchProjects = async () => {
    await projectStore.fetchProjects();
};

const handleCreateProject = async (data: { name: string; description: string; type: ProjectType }) => {
    try {
        await projectStore.createProject(data);
        showCreateProjectForm.value = false;
    } catch (err) {
        console.error('Failed to create project:', err);
    }
};

const openEditModal = (project: Project) => {
    projectToEdit.value = project;
    showEditModal.value = true;
};

const handleUpdateProject = async (data: { name: string; description: string; type: ProjectType }) => {
    if (!projectToEdit.value) return;

    try {
        await projectStore.updateProject(projectToEdit.value.id, {
            name: data.name,
            description: data.description
        });
        showEditModal.value = false;
    } catch (err) {
        console.error('Failed to update project:', err);
    }
};

const confirmDeleteProject = (projectId: number) => {
    const project = projectStore.projects.find(p => p.id === projectId);
    if (project) {
        projectToDelete.value = project;
        showDeleteModal.value = true;
    }
};

const executeDeleteProject = async () => {
    if (!projectToDelete.value) return;

    try {
        await projectStore.deleteProject(projectToDelete.value.id);
        showDeleteModal.value = false;
        projectToDelete.value = null;
    } catch (err) {
        console.error('Failed to delete project:', err);
    }
};
</script>