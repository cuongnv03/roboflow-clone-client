import axios from 'axios'
import type { Project, ProjectCreateData, ProjectUpdateData, ProjectStats } from '@/types/project'

// Get all projects
const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any[] }>('/projects')

    if (response.data.status === 'success' && response.data.data) {
      // Transform server response to match our types
      return response.data.data.map(transformProject)
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
const getProject = async (projectId: number): Promise<Project> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any }>(
      `/projects/${projectId}`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformProject(response.data.data)
    }

    throw new Error(response.data.message || `Failed to fetch project ${projectId}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || `Failed to fetch project ${projectId}`)
    }
    throw error
  }
}

// Get project statistics
const getProjectStats = async (projectId: number): Promise<ProjectStats> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any }>(
      `/projects/${projectId}/stats`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch project stats')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch project stats')
    }
    throw error
  }
}

// Create a project
const createProject = async (data: ProjectCreateData): Promise<Project> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      '/projects',
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformProject(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to create project')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create project')
    }
    throw error
  }
}

// Update project
const updateProject = async (projectId: number, data: ProjectUpdateData): Promise<Project> => {
  try {
    const response = await axios.put<{ status: string; message: string; data: any }>(
      `/projects/${projectId}`,
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformProject(response.data.data)
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
    const response = await axios.delete<{ status: string; message: string }>(
      `/projects/${projectId}`,
    )

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

// Helper function to transform project data
const transformProject = (data: any): Project => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    type: data.type,
    userId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export default {
  getProjects,
  getProject,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
}
