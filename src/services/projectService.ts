import axios from 'axios'
import type { ProjectDb } from '@/types/express/index'
import type { ProjectType } from '@/types/projectTypes'

interface ProjectResponse {
  status: string
  message: string
  data?: ProjectDb | ProjectDb[]
}

// Create a project
const createProject = async (data: {
  name: string
  description?: string | null
  type: ProjectType
}): Promise<ProjectDb> => {
  try {
    const response = await axios.post<ProjectResponse>('/projects', data)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data as ProjectDb
    }

    throw new Error(response.data.message || 'Failed to create project')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create project')
    }
    throw error
  }
}

// Get all projects
const getProjects = async (): Promise<ProjectDb[]> => {
  try {
    const response = await axios.get<ProjectResponse>('/projects')

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data as ProjectDb[]
    }

    throw new Error(response.data.message || 'Failed to fetch projects')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch projects')
    }
    throw error
  }
}

// Get project by ID
const getProject = async (projectId: number): Promise<ProjectDb> => {
  try {
    const response = await axios.get<ProjectResponse>(`/projects/${projectId}`)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data as ProjectDb
    }

    throw new Error(response.data.message || `Failed to fetch project ${projectId}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || `Failed to fetch project ${projectId}`)
    }
    throw error
  }
}

// Update project
const updateProject = async (
  projectId: number,
  data: { name?: string; description?: string | null },
): Promise<ProjectDb> => {
  try {
    const response = await axios.put<ProjectResponse>(`/projects/${projectId}`, data)

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data as ProjectDb
    }

    throw new Error(response.data.message || `Failed to update project ${projectId}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || `Failed to update project ${projectId}`)
    }
    throw error
  }
}

// Delete project
const deleteProject = async (projectId: number): Promise<void> => {
  try {
    const response = await axios.delete<ProjectResponse>(`/projects/${projectId}`)

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || `Failed to delete project ${projectId}`)
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || `Failed to delete project ${projectId}`)
    }
    throw error
  }
}

export default {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
}
