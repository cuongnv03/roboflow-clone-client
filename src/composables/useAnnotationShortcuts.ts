import { onMounted, onUnmounted } from 'vue'
import type { DrawingTool } from '@/types/annotation'

interface ShortcutOptions {
  onUndo?: () => void
  onRedo?: () => void
}

export function useAnnotationShortcuts(
  setTool: (tool: DrawingTool | null) => void,
  toolMapping: Record<string, DrawingTool | null> = {},
  options?: ShortcutOptions,
) {
  // Default key mapping
  const defaultToolMapping: Record<string, DrawingTool | null> = {
    v: 'select', // v for selection tool
    m: 'move', // m for move tool
    b: 'bbox', // b for bounding box
    p: 'polygon', // p for polygon
    k: 'keypoint', // k for keypoint
    r: 'brush', // r for brush (pencil)
    e: 'eraser', // e for eraser
    w: 'magic_wand', // w for magic wand
    s: 'skeleton', // s for skeleton
    c: 'classification', // c for classification
    Escape: null, // Escape to cancel drawing
  }

  // Merge default with any custom mappings
  const keyMap = { ...defaultToolMapping, ...toolMapping }

  // Handle keydown event
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore key events if user is typing in an input field
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
      return
    }

    // Undo - Ctrl+Z
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      if (options?.onUndo) {
        options.onUndo()
      }
      return
    }

    // Redo - Ctrl+Y or Ctrl+Shift+Z
    if (
      (event.ctrlKey && event.key === 'y') ||
      (event.ctrlKey && event.shiftKey && event.key === 'z')
    ) {
      event.preventDefault()
      if (options?.onRedo) {
        options.onRedo()
      }
      return
    }

    const key = event.key.toLowerCase()

    if (keyMap[key] !== undefined) {
      setTool(keyMap[key])
      event.preventDefault()
    }
  }

  // Add/remove event listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  // Return the key mappings for display in UI
  return {
    keyMap,
  }
}
