export type ProjectType =
  | 'object_detection'
  | 'classification'
  | 'instance_segmentation'
  | 'keypoint_detection'
  | 'multimodal'

// Helper array for validation (RUNTIME VALUE)
export const allowedProjectTypes: ProjectType[] = [
  'object_detection',
  'classification',
  'instance_segmentation',
  'keypoint_detection',
  'multimodal',
]

// Define Image Status based on ENUM in schema
export type ImageStatus = 'uploaded' | 'annotated' | 'processed'

// Define Dataset Status based on ENUM in schema
export type DatasetStatus = 'pending' | 'generating' | 'completed' | 'failed'

// Define Split Type based on ENUM in schema
export type SplitType = 'train' | 'valid' | 'test'
