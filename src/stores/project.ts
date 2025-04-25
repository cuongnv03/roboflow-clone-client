// src/stores/project.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import projectService from '@/services/projectService'; // Import service

import type { ProjectDb } from '@/types/express/index.d';
import type { ProjectType } from '@/types/projectTypes';

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const projects = ref<ProjectDb[]>([]);
  const currentProject = ref<ProjectDb | null>(null);
  const loading = ref(false);
  const loadingCurrent = ref(false);
  const error = ref<string | null>(null);

  // --- Getters ---
  const projectList = computed(() => projects.value);
  const activeProject = computed(() => currentProject.value);
  const isLoading = computed(() => loading.value);
  const isLoadingCurrent = computed(() => loadingCurrent.value);
  const projectError = computed(() => error.value);

  // --- Actions ---
  async function fetchProjects(): Promise<void> {
    loading.value = true;
    error.value = null;
    console.log('Fetching projects...');
    try {
      projects.value = await projectService.fetchProjects();
      console.log('Projects fetched:', projects.value.length);
    } catch (err: any) {
      console.error('Fetch Projects API error:', err);
      error.value = err.message || 'An unknown error occurred while fetching projects.';
      projects.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchProjectById(projectId: number | string): Promise<void> {
    loadingCurrent.value = true;
    error.value = null;
    currentProject.value = null;
    console.log(`Fetching project ${projectId}...`);
    try {
      currentProject.value = await projectService.fetchProjectById(projectId);
      console.log('Current project set:', currentProject.value?.name);
    } catch (err: any) {
      error.value = err.message || `Error fetching project ${projectId}.`;
      console.error('Fetch Project By ID API error:', err);
    } finally {
      loadingCurrent.value = false;
    }
  }

  async function createProject(projectData: {
    name: string;
    description?: string | null;
    type: ProjectType;
  }): Promise<ProjectDb | null> {
    loading.value = true;
    error.value = null;
    console.log('Creating project:', projectData.name);
    try {
      const newProject = await projectService.createProject(projectData);
      projects.value.unshift(newProject);
      return newProject;
    } catch (err: any) {
      console.error('Create Project API error:', err);
      error.value = err.message || 'An unknown error occurred while creating the project.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProject(
    projectId: number,
    projectData: { name?: string; description?: string | null },
  ): Promise<ProjectDb | null> {
    loading.value = true;
    error.value = null;
    console.log(`Updating project ${projectId}:`, projectData);
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      const index = projects.value.findIndex((p) => p.project_id === projectId);
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updatedProject };
      }
      if (currentProject.value?.project_id === projectId) {
        currentProject.value = { ...currentProject.value, ...updatedProject };
      }
      return updatedProject;
    } catch (err: any) {
      console.error('Update Project API error:', err);
      error.value = err.message || 'Error updating project.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProject(projectId: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    console.log(`Deleting project ${projectId}`);
    try {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        projects.value = projects.value.filter((p) => p.project_id !== projectId);
        console.log(`Project ${projectId} deleted.`);
        return true;
      } else {
        throw new Error('Failed to delete project.');
      }
    } catch (err: any) {
      console.error('Delete Project API error:', err);
      error.value = err.message || 'Error deleting project.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    projects,
    currentProject,
    loading,
    loadingCurrent,
    error,
    projectList,
    activeProject,
    isLoading,
    isLoadingCurrent,
    projectError,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
});
