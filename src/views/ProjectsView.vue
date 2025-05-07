<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">My Projects</h1>
      <button @click="showCreateProjectForm = !showCreateProjectForm" class="btn btn-primary">
        {{ showCreateProjectForm ? 'Cancel' : '+ New Project' }}
      </button>
    </div>

    <!-- Create Project Form -->
    <div v-if="showCreateProjectForm" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Create New Project</h2>
      <ProjectForm :is-loading="projectStore.isLoading" @submit="handleCreateProject"
        @cancel="showCreateProjectForm = false" />
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.isLoading && !projectStore.projects.length" class="text-center py-16">
      <svg class="animate-spin h-10 w-10 text-brand-purple mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="text-gray-600">Loading your projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="projectStore.projectError" class="bg-red-50 border border-red-300 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
    <ProjectList :projects="projectStore.projects" @create="showCreateProjectForm = true" @edit="openEditModal"
      @delete="confirmDeleteProject" />

    <!-- Edit Project Modal -->
    <Modal v-model="showEditModal" title="Edit Project">
      <ProjectForm v-if="showEditModal" :project="projectToEdit" :is-loading="projectStore.isLoading" :is-edit="true"
        @submit="handleUpdateProject" @cancel="showEditModal = false" />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" title="Delete Project">
      <p class="mb-4 text-gray-600">
        Are you sure you want to delete <strong>{{ projectToDelete?.name }}</strong>?
        This action cannot be undone and all associated data will be permanently removed.
      </p>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="executeDeleteProject" class="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
            :disabled="projectStore.isLoading">
            <span v-if="projectStore.isLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Deleting...
            </span>
            <span v-else>Delete Project</span>
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import type { ProjectDb } from '@/types/express/index';
import type { ProjectType } from '@/types/projectTypes';
import ProjectList from '@/components/projects/ProjectList.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import Modal from '@/components/ui/Modal.vue';

// Store
const projectStore = useProjectStore();

// State
const showCreateProjectForm = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const projectToEdit = ref<ProjectDb | null>(null);
const projectToDelete = ref<ProjectDb | null>(null);

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

const openEditModal = (project: ProjectDb) => {
  projectToEdit.value = project;
  showEditModal.value = true;
};

const handleUpdateProject = async (data: { name: string; description: string; type: ProjectType }) => {
  if (!projectToEdit.value) return;

  try {
    await projectStore.updateProject(projectToEdit.value.project_id, {
      name: data.name,
      description: data.description
    });
    showEditModal.value = false;
  } catch (err) {
    console.error('Failed to update project:', err);
  }
};

const confirmDeleteProject = (projectId: number) => {
  const project = projectStore.projects.find(p => p.project_id === projectId);
  if (project) {
    projectToDelete.value = project;
    showDeleteModal.value = true;
  }
};

const executeDeleteProject = async () => {
  if (!projectToDelete.value) return;

  try {
    await projectStore.deleteProject(projectToDelete.value.project_id);
    showDeleteModal.value = false;
    projectToDelete.value = null;
  } catch (err) {
    console.error('Failed to delete project:', err);
  }
};
</script>