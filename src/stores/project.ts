import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

import type { ProjectDb } from '@/types/express/index.d'
import type { ProjectType } from '@/types/projectTypes'
interface ProjectListApiResponse {
  success: boolean
  count?: number
  projects?: ProjectDb[]
  message?: string // For errors
}
interface ProjectApiResponse {
  success: boolean
  project?: ProjectDb
  message?: string // For errors
}
interface SuccessApiResponse {
  success: boolean
  message?: string
}

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const projects = ref<ProjectDb[]>([])
  const currentProject = ref<ProjectDb | null>(null)
  const loading = ref(false)
  const loadingCurrent = ref(false) // Specific loading for single project fetch
  const error = ref<string | null>(null)

  // --- Getters ---
  const projectList = computed(() => projects.value)
  const activeProject = computed(() => currentProject.value) // Getter for current project
  const isLoading = computed(() => loading.value)
  const isLoadingCurrent = computed(() => loadingCurrent.value) // Getter for single project loading
  const projectError = computed(() => error.value)

  // --- Actions ---
  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    console.log('Fetching projects...')
    try {
      const response = await axios.get('/projects')
      if (response.data.status === 'success') {
        projects.value = response.data.data
        console.log('Projects fetched:', projects.value.length)
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch projects: Invalid server response.',
        )
      }
    } catch (err: any) {
      console.error('Fetch Projects API error:', err)
      error.value =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred while fetching projects.'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  // Fetch a single project by ID
  async function fetchProjectById(projectId: number | string): Promise<void> {
    loadingCurrent.value = true
    error.value = null
    currentProject.value = null // Clear previous project
    console.log(`Fetching project ${projectId}...`)
    try {
      const response = await axios.get(`/projects/${projectId}`)
      if (response.data.status === 'success') {
        currentProject.value = response.data.data
        console.log('Current project set:', currentProject.value?.name)
      } else {
        throw new Error(response.data.message || `Failed to fetch project ${projectId}.`)
      }
    } catch (err: any) {
      error.value =
        err.response?.data?.message || err.message || `Error fetching project ${projectId}.`
      console.error('Fetch Project By ID API error:', err)
    } finally {
      loadingCurrent.value = false
    }
  }

  // Use ProjectType from the imported type alias
  async function createProject(projectData: {
    name: string
    description?: string | null
    type: ProjectType
  }): Promise<ProjectDb | null> {
    loading.value = true
    error.value = null
    console.log('Creating project:', projectData.name)
    try {
      // Use ProjectApiResponse which references ProjectDb
      const response = await axios.post('/projects', projectData)
      if (response.data.status === 'success') {
        console.log('Project created:', response.data.project.project_id)
        projects.value.unshift(response.data.data)
        return response.data.data
      } else {
        throw new Error(
          response.data.message || 'Failed to create project: Invalid server response.',
        )
      }
    } catch (err: any) {
      console.error('Create Project API error:', err)
      const message =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred while creating the project.'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  // Update an existing project
  async function updateProject(
    projectId: number,
    projectData: { name?: string; description?: string | null },
  ): Promise<ProjectDb | null> {
    loading.value = true // Use general loading for updates/deletes
    error.value = null
    console.log(`Updating project ${projectId}:`, projectData)
    try {
      const response = await axios.put(`/projects/${projectId}`, projectData)
      if (response.data.status === 'success') {
        const index = projects.value.findIndex((p) => p.project_id === projectId)
        if (index !== -1) {
          projects.value[index] = { ...projects.value[index], ...response.data.data }
        }
        // Also update currentProject if it's the one being edited
        if (currentProject.value?.project_id === projectId) {
          currentProject.value = { ...currentProject.value, ...response.data.data }
        }
        return response.data.project
      } else {
        throw new Error(response.data.message || 'Failed to update project.')
      }
    } catch (err: any) {
      console.error('Update Project API error:', err)
      const message = err.response?.data?.message || err.message || 'Error updating project.'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  // Delete a project
  async function deleteProject(projectId: number): Promise<boolean> {
    loading.value = true
    error.value = null
    console.log(`Deleting project ${projectId}`)
    try {
      const response = await axios.delete(`/projects/${projectId}`)
      if (response.data.status === 'success') {
        // Remove the project from the local list
        projects.value = projects.value.filter((p) => p.project_id !== projectId)
        console.log(`Project ${projectId} deleted.`)
        return true
      } else {
        throw new Error(response.data.message || 'Failed to delete project.')
      }
    } catch (err: any) {
      console.error('Delete Project API error:', err)
      const message = err.response?.data?.message || err.message || 'Error deleting project.'
      error.value = message
      throw new Error(message) // Re-throw for component
    } finally {
      loading.value = false
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
  }
})
