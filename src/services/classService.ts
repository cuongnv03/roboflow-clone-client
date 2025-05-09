import axios from 'axios'
import type { ClassCreateDTO, ClassResponseDTO, ClassUpdateDTO } from '@/types/class'

// Get classes for a project
const getProjectClasses = async (projectId: number): Promise<ClassResponseDTO[]> => {
  try {
    const response = await axios.get<{ status: string; message: string; data: any[] }>(
      `/projects/${projectId}/classes`,
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.map(transformClass)
    }

    throw new Error(response.data.message || 'Failed to fetch classes')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch classes')
    }
    throw error
  }
}

// Create a new class
const createClass = async (projectId: number, data: ClassCreateDTO): Promise<ClassResponseDTO> => {
  try {
    const response = await axios.post<{ status: string; message: string; data: any }>(
      `/projects/${projectId}/classes`,
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformClass(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to create class')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create class')
    }
    throw error
  }
}

// Update a class
const updateClass = async (classId: number, data: ClassUpdateDTO): Promise<ClassResponseDTO> => {
  try {
    const response = await axios.put<{ status: string; message: string; data: any }>(
      `/projects/classes/${classId}`,
      data,
    )

    if (response.data.status === 'success' && response.data.data) {
      return transformClass(response.data.data)
    }

    throw new Error(response.data.message || 'Failed to update class')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update class')
    }
    throw error
  }
}

// Delete a class
const deleteClass = async (classId: number): Promise<void> => {
  try {
    const response = await axios.delete<{ status: string; message: string }>(
      `/projects/classes/${classId}`,
    )

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to delete class')
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete class')
    }
    throw error
  }
}

// Helper function to transform class data from API
const transformClass = (data: any): ClassResponseDTO => {
  return {
    id: data.id,
    projectId: data.projectId,
    name: data.name,
    color: data.color,
    createdAt: data.createdAt,
  }
}

export default {
  getProjectClasses,
  createClass,
  updateClass,
  deleteClass,
}
