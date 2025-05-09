import type { DrawingTool } from '@/types/annotation'

export type ProjectType =
  | 'object_detection'
  | 'instance_segmentation'
  | 'semantic_segmentation'
  | 'keypoint_detection'
  | 'classification'

// Lấy các công cụ vẽ hợp lệ cho loại dự án
export function getDrawingToolsForProjectType(projectType: ProjectType): DrawingTool[] {
  const commonTools: DrawingTool[] = ['select', 'move', 'zoom', 'pan']

  switch (projectType) {
    case 'object_detection':
      return ['bbox', ...commonTools]

    case 'instance_segmentation':
      return ['polygon', 'brush', 'eraser', 'magic_wand', ...commonTools]

    case 'semantic_segmentation':
      return ['brush', 'eraser', 'magic_wand', ...commonTools]

    case 'keypoint_detection':
      return ['keypoint', 'skeleton', ...commonTools]

    case 'classification':
      return ['classification', ...commonTools]

    default:
      return commonTools
  }
}

// Lấy biểu tượng và tooltip cho mỗi công cụ
export function getToolInfo(tool: DrawingTool): { icon: string; label: string } {
  switch (tool) {
    case 'select':
      return {
        icon: 'cursor-pointer',
        label: 'Select',
      }
    case 'move':
      return {
        icon: 'arrows-move',
        label: 'Move Annotation',
      }
    case 'zoom':
      return {
        icon: 'zoom-in',
        label: 'Zoom',
      }
    case 'pan':
      return {
        icon: 'hand',
        label: 'Pan Canvas',
      }
    case 'bbox':
      return {
        icon: 'rectangle-box',
        label: 'Bounding Box',
      }
    case 'polygon':
      return {
        icon: 'polygon',
        label: 'Polygon',
      }
    case 'brush':
      return {
        icon: 'brush',
        label: 'Brush',
      }
    case 'eraser':
      return {
        icon: 'eraser',
        label: 'Eraser',
      }
    case 'magic_wand':
      return {
        icon: 'magic-wand',
        label: 'Magic Wand',
      }
    case 'keypoint':
      return {
        icon: 'point',
        label: 'Keypoint',
      }
    case 'skeleton':
      return {
        icon: 'skeleton',
        label: 'Skeleton',
      }
    case 'classification':
      return {
        icon: 'tag',
        label: 'Classification',
      }
    default:
      return {
        icon: 'help-circle',
        label: 'Unknown Tool',
      }
  }
}
