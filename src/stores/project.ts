import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import projectService from '@/services/projectService'
import type { ProjectDb } from '@/types/express/index'
import type { ProjectType } from '@/types/projectTypes'

export interface ProjectCreateData {
  name: string
  description?: string | null
  type: ProjectType
}

export interface ProjectUpdateData {
  name?: string
  description?: string | null
}

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<ProjectDb[]>([])
  const activeProject = ref<ProjectDb | null>(null)
  const loading = ref(false)
  const loadingCurrent = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const projectList = computed(() => projects.value)
  const isLoading = computed(() => loading.value)
  const isLoadingCurrent = computed(() => loadingCurrent.value)
  const projectError = computed(() => error.value)

  // Actions
  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const fetchedProjects = await projectService.getProjects()
      projects.value = fetchedProjects
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchProjectById(projectId: number): Promise<void> {
    loadingCurrent.value = true
    error.value = null

    try {
      const project = await projectService.getProject(projectId)
      activeProject.value = project
    } catch (err: any) {
      error.value = err.message || `Failed to fetch project ${projectId}`
      console.error(`Error fetching project ${projectId}:`, err)
    } finally {
      loadingCurrent.value = false
    }
  }

  async function createProject(data: ProjectCreateData): Promise<ProjectDb> {
    loading.value = true
    error.value = null

    try {
      const newProject = await projectService.createProject(data)
      projects.value = [newProject, ...projects.value]
      return newProject
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(projectId: number, data: ProjectUpdateData): Promise<ProjectDb> {
    loading.value = true
    error.value = null

    try {
      const updatedProject = await projectService.updateProject(projectId, data)

      // Update project in the list
      const index = projects.value.findIndex((p) => p.project_id === projectId)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      // Update active project if it's the one being updated
      if (activeProject.value?.project_id === projectId) {
        activeProject.value = updatedProject
      }

      return updatedProject
    } catch (err: any) {
      error.value = err.message || `Failed to update project ${projectId}`
      console.error(`Error updating project ${projectId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(projectId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await projectService.deleteProject(projectId)
      projects.value = projects.value.filter((p) => p.project_id !== projectId)

      // Clear active project if it's the one being deleted
      if (activeProject.value?.project_id === projectId) {
        activeProject.value = null
      }
    } catch (err: any) {
      error.value = err.message || `Failed to delete project ${projectId}`
      console.error(`Error deleting project ${projectId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    projects,
    activeProject,
    loading,
    loadingCurrent,
    error,

    // Getters
    projectList,
    isLoading,
    isLoadingCurrent,
    projectError,

    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  }
})
