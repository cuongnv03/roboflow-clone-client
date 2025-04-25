// src/services/projectService.ts
import axios from 'axios';
import type { ProjectDb, ProjectCreationPayload, ProjectUpdatePayload } from '@/types/express/index.d';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
axios.defaults.baseURL = API_BASE_URL;

const fetchProjects = async (): Promise<ProjectDb[]> => {
  try {
    const response = await axios.get<ProjectDb[]>('/projects');
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch projects.');
    }
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

const fetchProjectById = async (projectId: number | string): Promise<ProjectDb> => {
  try {
    const response = await axios.get<ProjectDb>(`/projects/${projectId}`);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || `Failed to fetch project ${projectId}.`);
    }
  } catch (error: any) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

const createProject = async (projectData: ProjectCreationPayload): Promise<ProjectDb> => {
  try {
    const response = await axios.post<ProjectDb>('/projects', projectData);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create project.');
    }
  } catch (error: any) {
    console.error('Error creating project:', error);
    throw error;
  }
};

const updateProject = async (
  projectId: number,
  projectData: ProjectUpdatePayload,
): Promise<ProjectDb> => {
  try {
    const response = await axios.put<ProjectDb>(`/projects/${projectId}`, projectData);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || `Failed to update project ${projectId}.`);
    }
  } catch (error: any) {
    console.error(`Error updating project ${projectId}:`, error);
    throw error;
  }
};

const deleteProject = async (projectId: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`/projects/${projectId}`);
    if (response.data.status === 'success') {
      return true;
    } else {
      throw new Error(response.data.message || `Failed to delete project ${projectId}.`);
    }
  } catch (error: any) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw error;
  }
};

export default {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
};
