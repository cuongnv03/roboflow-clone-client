export type AnnotationType =
  | 'bbox'
  | 'polygon'
  | 'brush'
  | 'eraser'
  | 'magic_wand'
  | 'keypoint'
  | 'skeleton'
  | 'classification'

// Base interface for all annotations
export interface BaseAnnotation {
  id?: number
  imageId: number
  classId: number
  type: AnnotationType
}

// Bounding box annotation
export interface BBoxAnnotation extends BaseAnnotation {
  type: 'bbox'
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Polygon annotation
export interface PolygonAnnotation extends BaseAnnotation {
  type: 'polygon'
  coordinates: Array<{ x: number; y: number }>
}

// Keypoint annotation
export interface KeypointAnnotation extends BaseAnnotation {
  type: 'keypoint'
  coordinates: Array<{
    x: number
    y: number
    visible: boolean
    name?: string
  }>
}

export interface BrushAnnotation extends BaseAnnotation {
  type: 'brush'
  coordinates: {
    paths: Array<Array<{ x: number; y: number }>>
    width: number
  }
}

export interface SkeletonAnnotation extends BaseAnnotation {
  type: 'skeleton'
  coordinates: {
    points: Array<{
      x: number
      y: number
      visible: boolean
      name?: string
    }>
    connections: Array<[number, number]> // Indices of connected points
  }
}

// Classification annotation
export interface ClassificationAnnotation extends BaseAnnotation {
  type: 'classification'
  // No coordinates needed for classification
}

// Union type for all annotation types
export type Annotation =
  | BBoxAnnotation
  | PolygonAnnotation
  | BrushAnnotation
  | KeypointAnnotation
  | SkeletonAnnotation
  | ClassificationAnnotation

export type DrawingTool = AnnotationType | 'select' | 'move' | 'zoom' | 'pan'

// Annotation creation parameters - updated to handle different types properly
export interface AnnotationCreateParams {
  imageId: number
  classId: number
  data: {
    type: AnnotationType
    coordinates?: any // Optional since classification doesn't have coordinates
  }
}

// For tracking temporary annotations being drawn
export interface DrawingState {
  isDrawing: boolean
  currentTool: AnnotationType | null
  points: Array<{ x: number; y: number }>
  startPoint: { x: number; y: number } | null
  temporaryAnnotation: Partial<Annotation> | null
}
