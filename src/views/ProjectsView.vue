<template>
  <div class="mx-auto max-w-7xl p-6 lg:px-8 mt-4">
    <div class=" flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">My Projects</h1>
      <button @click="showCreateForm = !showCreateForm" class="btn btn-primary">
        {{ showCreateForm ? 'Cancel Create' : '+ New Project' }}
      </button>
    </div>

    <ProjectCreateForm v-if="showCreateForm" :isLoading="projectStore.isLoading" @create="handleCreateProject" />

    <div v-if="projectStore.isLoading && projects.length === 0 && !projectStore.projectError"
      class="text-center py-10">
      <p class="text-gray-500">Loading projects...</p>
    </div>

    <div v-else-if="projectStore.projectError && projects.length === 0"
      class="rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700">
      <p>Error loading projects: {{ projectStore.projectError }}</p>
    </div>

    <ProjectList :projects="projects" @create="showCreateForm = true" @edit="openEditModal"
      @delete="confirmDeleteProject" />

    <ProjectEditModal :show="showEditModal" :project="editingProject" :isLoading="projectStore.isLoading"
      @update="handleUpdateProject" @close="closeEditModal" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useProjectStore } from '@/stores/project';
import type { ProjectDb } from '@/types/express/index.d';
import type { ProjectType } from '@/types/projectTypes';
import ProjectList from '@/components/projects/ProjectList.vue';
import ProjectCreateForm from '@/components/projects/ProjectCreateForm.vue';
import ProjectEditModal from '@/components/projects/ProjectEditModal.vue';

const projectStore = useProjectStore();

const showCreateForm = ref(false);
const showEditModal = ref(false);
const editingProject = ref<ProjectDb>({} as ProjectDb);

const projects = computed(() => projectStore.projectList);

onMounted(() => {
  projectStore.fetchProjects();
});

const handleCreateProject = async (projectData: { name: string; description: string | null; type: ProjectType }) => {
  try {
    await projectStore.createProject(projectData);
    showCreateForm.value = false;
  } catch (err: any) {
    console.error("Failed to create project:", err);
  }
};

const openEditModal = (project: ProjectDb) => {
  editingProject.value = { ...project };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleUpdateProject = async ({ projectId, updates }: { projectId: number; updates: { name: string; description: string | null } }) => {
  try {
    await projectStore.updateProject(projectId, updates);
    closeEditModal();
  } catch (err: any) {
    console.error("Failed to update project:", err);
  }
};

const confirmDeleteProject = async (projectId: number, projectName: string) => {
  if (window.confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
    try {
      await projectStore.deleteProject(projectId);
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert(`Error deleting project: ${err.message || 'Unknown error'}`);
    }
  }
};
</script>
