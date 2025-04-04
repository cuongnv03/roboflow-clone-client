import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
// This import should now work after you create the file:
import type { ProjectDb } from '@/types/express/index.d'
// Import ProjectType from the correct file
import type { ProjectType } from '@/types/projectTypes'

// Matches backend list response structure
interface ProjectListApiResponse {
  success: boolean
  count?: number
  projects?: ProjectDb[]
  message?: string // For errors
}

// Matches backend single project response structure
interface ProjectApiResponse {
  success: boolean
  project?: ProjectDb
  message?: string // For errors
}

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const projects = ref<ProjectDb[]>([])
  const currentProject = ref<ProjectDb | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Getters ---
  const projectList = computed(() => projects.value)
  const isLoading = computed(() => loading.value)
  const projectError = computed(() => error.value)

  // --- Actions ---
  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    console.log('Fetching projects...')
    try {
      const response = await axios.get<ProjectListApiResponse>('/projects')
      if (response.data.success && response.data.projects) {
        projects.value = response.data.projects
        console.log('Projects fetched:', projects.value.length)
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch projects: Invalid server response.',
        )
      }
    } catch (err: any) {
      console.error('Fetch Projects API error:', err)
      const message =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred while fetching projects.'
      error.value = message
      projects.value = []
    } finally {
      loading.value = false
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
      const response = await axios.post<ProjectApiResponse>('/projects', projectData)
      if (response.data.success && response.data.project) {
        console.log('Project created:', response.data.project.project_id)
        projects.value.unshift(response.data.project)
        return response.data.project
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

  return {
    projects,
    currentProject,
    loading,
    error,
    projectList,
    isLoading,
    projectError,
    fetchProjects,
    createProject,
  }
})
