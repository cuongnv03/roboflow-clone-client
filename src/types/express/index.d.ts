import type { RowDataPacket } from 'mysql2' // Okay to import type from library
// Import local type aliases using 'import type'
import type { ProjectType, SplitType, ImageStatus, DatasetStatus } from '../projectTypes'

// --- Interfaces mirroring backend data structures ---

// Define the structure of the user object we'll attach to the request
// (This is actually for Express Request on backend, but useful for frontend state too)
interface AuthenticatedUser {
  userId: number
  email: string
}

// Extend the Express Request interface (This part is only relevant for backend TS)
// declare global {
//     namespace Express {
//         interface Request {
//             user?: AuthenticatedUser;
//             file?: Multer.File;
//             files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
//         }
//     }
// }

// --- DB Structure Interfaces (for frontend use, mirroring backend) ---

export interface UserDb extends RowDataPacket {
  user_id: number
  username: string
  email: string
  // password_hash should not be sent to frontend
  created_at: string // Use string for dates transferred via JSON
  updated_at: string
  is_active: boolean
}

export interface ProjectDb extends RowDataPacket {
  project_id: number
  user_id: number
  name: string
  description: string | null
  type: ProjectType // Use imported type alias
  created_at: string // Use string for dates transferred via JSON
  updated_at: string
}

export interface ImageDb extends RowDataPacket {
  image_id: number
  project_id: number
  file_path: string
  original_filename: string
  width: number
  height: number
  upload_date: string // Use string for dates transferred via JSON
  status: ImageStatus // Use imported type alias
}

export interface ClassDb extends RowDataPacket {
  class_id: number
  project_id: number
  name: string
  color: string | null
  created_at: string // Use string for dates transferred via JSON
}

export interface AnnotationDb extends RowDataPacket {
  annotation_id: number
  image_id: number
  class_id: number
  annotation_data: any // JSON type
  created_at: string // Use string for dates transferred via JSON
  is_valid: boolean
  // Optional joined fields
  class_name?: string
  class_color?: string
}

export interface DatasetDb extends RowDataPacket {
  dataset_id: number
  project_id: number
  name: string
  created_date: string // Use string for dates transferred via JSON
  preprocessing_settings: any | null // JSON
  augmentation_settings: any | null // JSON
  status: DatasetStatus // Use imported type alias
}

export interface DatasetImageDb extends RowDataPacket {
  dataset_id: number
  image_id: number
  split: SplitType // Use imported type alias
  // Optional joined fields
  file_path?: string
  original_filename?: string
}
