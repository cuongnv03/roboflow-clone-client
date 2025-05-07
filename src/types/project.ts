export type ProjectType =
  | 'object_detection'
  | 'classification'
  | 'instance_segmentation'
  | 'keypoint_detection'
  | 'multimodal'

export const PROJECT_TYPES: ProjectType[] = [
  'object_detection',
  'classification',
  'instance_segmentation',
  'keypoint_detection',
  'multimodal',
]

export interface Project {
  id: number
  name: string
  description: string | null
  type: ProjectType
  userId: number
  createdAt: string
  updatedAt: string
}

export interface ProjectStats {
  totalImages: number
  annotatedImages: number
  totalAnnotations: number
  classDistribution: Array<{
    name: string
    count: number
  }>
}

export interface ProjectCreateData {
  name: string
  description?: string
  type: ProjectType
}

export interface ProjectUpdateData {
  name?: string
  description?: string
}
