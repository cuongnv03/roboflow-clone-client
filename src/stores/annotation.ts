import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import annotationService from '@/services/annotationService'
import classService from '@/services/classService'
import type { Annotation, AnnotationType, DrawingState } from '@/types/annotation'
import type { ClassResponseDTO } from '@/types/class'

// Định nghĩa kiểu thao tác lịch sử
interface HistoryAction {
  type: 'create' | 'update' | 'delete'
  annotation: Annotation
  previous?: Annotation // Dùng cho update để lưu trạng thái trước đó
}

export const useAnnotationStore = defineStore('annotation', () => {
  // State
  const annotations = ref<Annotation[]>([])
  const selectedAnnotationId = ref<number | null>(null)
  const selectedClassId = ref<number | null>(null)
  const currentImageId = ref<number | null>(null)
  const drawingState = ref<DrawingState>({
    isDrawing: false,
    currentTool: null,
    points: [],
    startPoint: null,
    temporaryAnnotation: null,
  })
  const classes = ref<ClassResponseDTO[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Thêm state cho lịch sử thao tác
  const history = ref<HistoryAction[]>([])
  const historyIndex = ref(-1) // -1 nghĩa là không có lịch sử

  // Getters
  const selectedAnnotation = computed(() => {
    return annotations.value.find((a) => a.id === selectedAnnotationId.value) || null
  })

  const selectedClass = computed(() => {
    return classes.value.find((c) => c.id === selectedClassId.value) || null
  })

  const getClassById = (id: number) => {
    return classes.value.find((c) => c.id === id) || null
  }

  // Thêm getters cho Undo/Redo
  const canUndo = computed(() => historyIndex.value >= 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Actions
  async function fetchAnnotations(imageId: number): Promise<void> {
    loading.value = true
    error.value = null
    currentImageId.value = imageId

    try {
      const fetchedAnnotations = await annotationService.getImageAnnotations(imageId)
      annotations.value = fetchedAnnotations
      // Reset lịch sử khi chuyển ảnh
      history.value = []
      historyIndex.value = -1
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch annotations'
      console.error('Error fetching annotations:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchClasses(projectId: number): Promise<void> {
    try {
      const fetchedClasses = await classService.getProjectClasses(projectId)
      classes.value = fetchedClasses

      // Select the first class by default if available
      if (classes.value.length > 0 && !selectedClassId.value) {
        selectedClassId.value = classes.value[0].id
      }
    } catch (err: any) {
      console.error('Error fetching classes:', err)
    }
  }

  async function createAnnotation(annotation: Omit<Annotation, 'id'>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Create the data object based on annotation type
      const data: any = {
        type: annotation.type,
      }

      // Only add coordinates if the annotation type has them
      if ('coordinates' in annotation) {
        data.coordinates = annotation.coordinates
      }

      const createParams = {
        imageId: annotation.imageId,
        classId: annotation.classId,
        data,
      }

      const createdAnnotation = await annotationService.createAnnotation(createParams)
      annotations.value.push(createdAnnotation)
      selectedAnnotationId.value = createdAnnotation.id || null

      // Thêm vào lịch sử
      addToHistory({
        type: 'create',
        annotation: createdAnnotation,
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to create annotation'
      console.error('Error creating annotation:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateAnnotation(
    annotationId: number,
    data: Partial<Omit<Annotation, 'id' | 'imageId'>>,
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Lưu trạng thái trước khi cập nhật để dùng cho undo
      const previousAnnotation = annotations.value.find((a) => a.id === annotationId)
      if (!previousAnnotation) {
        throw new Error('Annotation not found')
      }

      const updatedAnnotation = await annotationService.updateAnnotation(annotationId, data)

      // Update the annotation in the local array
      const index = annotations.value.findIndex((a) => a.id === annotationId)
      if (index !== -1) {
        annotations.value[index] = updatedAnnotation
      }

      // Thêm vào lịch sử
      addToHistory({
        type: 'update',
        annotation: updatedAnnotation,
        previous: { ...previousAnnotation }, // Tạo bản sao để tránh tham chiếu
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to update annotation'
      console.error('Error updating annotation:', err)
    } finally {
      loading.value = false
    }
  }

  async function deleteAnnotation(annotationId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Lưu trạng thái trước khi xóa để dùng cho undo
      const annotationToDelete = annotations.value.find((a) => a.id === annotationId)
      if (!annotationToDelete) {
        throw new Error('Annotation not found')
      }

      await annotationService.deleteAnnotation(annotationId)

      // Remove from local array
      annotations.value = annotations.value.filter((a) => a.id !== annotationId)

      // Clear selection if this was the selected annotation
      if (selectedAnnotationId.value === annotationId) {
        selectedAnnotationId.value = null
      }

      // Thêm vào lịch sử
      addToHistory({
        type: 'delete',
        annotation: { ...annotationToDelete }, // Tạo bản sao để tránh tham chiếu
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to delete annotation'
      console.error('Error deleting annotation:', err)
    } finally {
      loading.value = false
    }
  }

  // Thêm các phương thức cho Undo/Redo
  function addToHistory(action: HistoryAction): void {
    // Khi thêm một hành động mới, cắt bỏ phần lịch sử "tương lai" nếu đã undo
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Thêm hành động mới vào lịch sử
    history.value.push(action)
    historyIndex.value = history.value.length - 1
  }

  async function undo(): Promise<void> {
    if (!canUndo.value) return

    const action = history.value[historyIndex.value]

    try {
      loading.value = true

      if (action.type === 'create') {
        // Hoàn tác tạo mới = xóa
        if (action.annotation.id) {
          await annotationService.deleteAnnotation(action.annotation.id)
          annotations.value = annotations.value.filter((a) => a.id !== action.annotation.id)

          if (selectedAnnotationId.value === action.annotation.id) {
            selectedAnnotationId.value = null
          }
        }
      } else if (action.type === 'update' && action.previous) {
        // Hoàn tác cập nhật = khôi phục trạng thái trước
        const { id, imageId, ...updateData } = action.previous

        if (id) {
          const updated = await annotationService.updateAnnotation(id, updateData)

          const index = annotations.value.findIndex((a) => a.id === id)
          if (index !== -1) {
            annotations.value[index] = updated
          }
        }
      } else if (action.type === 'delete') {
        // Hoàn tác xóa = tạo lại
        const { id, ...createData } = action.annotation

        // Create the data object based on annotation type
        const data: any = {
          type: createData.type,
        }

        // Only add coordinates if the annotation type has them
        if ('coordinates' in createData) {
          data.coordinates = createData.coordinates
        }

        const created = await annotationService.createAnnotation({
          imageId: createData.imageId,
          classId: createData.classId,
          data,
        })

        annotations.value.push(created)
      }

      // Giảm chỉ mục lịch sử
      historyIndex.value--
    } catch (err: any) {
      console.error('Error performing undo:', err)
      error.value = 'Failed to undo action'
    } finally {
      loading.value = false
    }
  }

  async function redo(): Promise<void> {
    if (!canRedo.value) return

    historyIndex.value++
    const action = history.value[historyIndex.value]

    try {
      loading.value = true

      if (action.type === 'create') {
        // Làm lại tạo mới
        const { id, ...createData } = action.annotation

        // Create the data object based on annotation type
        const data: any = {
          type: createData.type,
        }

        // Only add coordinates if the annotation type has them
        if ('coordinates' in createData) {
          data.coordinates = createData.coordinates
        }

        const created = await annotationService.createAnnotation({
          imageId: createData.imageId,
          classId: createData.classId,
          data,
        })

        annotations.value.push(created)
        selectedAnnotationId.value = created.id || null
      } else if (action.type === 'update') {
        // Làm lại cập nhật
        const { id, imageId, ...updateData } = action.annotation

        if (id) {
          const updated = await annotationService.updateAnnotation(id, updateData)

          const index = annotations.value.findIndex((a) => a.id === id)
          if (index !== -1) {
            annotations.value[index] = updated
          }
        }
      } else if (action.type === 'delete') {
        // Làm lại xóa
        if (action.annotation.id) {
          await annotationService.deleteAnnotation(action.annotation.id)
          annotations.value = annotations.value.filter((a) => a.id !== action.annotation.id)

          if (selectedAnnotationId.value === action.annotation.id) {
            selectedAnnotationId.value = null
          }
        }
      }
    } catch (err: any) {
      console.error('Error performing redo:', err)
      error.value = 'Failed to redo action'

      // Revert index if failed
      historyIndex.value--
    } finally {
      loading.value = false
    }
  }

  // Drawing state management
  function setCurrentTool(tool: AnnotationType | null): void {
    drawingState.value.currentTool = tool
    // Reset drawing state when changing tools
    if (tool !== null) {
      resetDrawingState()
    }
  }

  function startDrawing(point: { x: number; y: number }): void {
    drawingState.value.isDrawing = true
    drawingState.value.startPoint = point
    drawingState.value.points = [point]
  }

  function updateDrawing(point: { x: number; y: number }): void {
    if (!drawingState.value.isDrawing) return

    const tool = drawingState.value.currentTool

    if (tool === 'bbox') {
      // Only need start point and current point for bbox
      if (drawingState.value.points.length > 1) {
        drawingState.value.points[1] = point
      } else {
        drawingState.value.points.push(point)
      }

      // Update temporary annotation
      if (drawingState.value.startPoint) {
        const startPoint = drawingState.value.startPoint
        const width = point.x - startPoint.x
        const height = point.y - startPoint.y

        drawingState.value.temporaryAnnotation = {
          type: 'bbox',
          coordinates: {
            x: width >= 0 ? startPoint.x : point.x,
            y: height >= 0 ? startPoint.y : point.y,
            width: Math.abs(width),
            height: Math.abs(height),
          },
        }
      }
    } else if (tool === 'polygon') {
      // For polygon, we update the last point while moving
      if (drawingState.value.points.length > 0 && !drawingState.value.isDrawing) {
        drawingState.value.points[drawingState.value.points.length - 1] = point
      }

      // Update temporary annotation
      drawingState.value.temporaryAnnotation = {
        type: 'polygon',
        coordinates: [...drawingState.value.points],
      }
    } else if (tool === 'keypoint') {
      // For keypoint, we just update the current point
      if (drawingState.value.points.length > 0) {
        drawingState.value.points[0] = point
      }

      // Update temporary annotation
      drawingState.value.temporaryAnnotation = {
        type: 'keypoint',
        coordinates: [{ x: point.x, y: point.y, visible: true }],
      }
    }
  }

  function addPoint(point: { x: number; y: number }): void {
    if (drawingState.value.currentTool === 'polygon') {
      drawingState.value.points.push(point)

      // Update temporary annotation
      drawingState.value.temporaryAnnotation = {
        type: 'polygon',
        coordinates: [...drawingState.value.points],
      }
    }
  }

  function finishDrawing(): void {
    if (!drawingState.value.isDrawing || !currentImageId.value || !selectedClassId.value) return

    const tool = drawingState.value.currentTool

    if (!tool) return

    // Create actual annotation based on the drawing
    if (tool === 'bbox' && drawingState.value.temporaryAnnotation) {
      const tempAnnotation = drawingState.value.temporaryAnnotation as any
      const bboxAnnotation = {
        imageId: currentImageId.value,
        classId: selectedClassId.value,
        type: 'bbox' as const,
        coordinates: tempAnnotation.coordinates,
      }

      // Only create annotation if it has valid dimensions
      if (bboxAnnotation.coordinates.width > 5 && bboxAnnotation.coordinates.height > 5) {
        createAnnotation(bboxAnnotation)
      }
    } else if (tool === 'polygon' && drawingState.value.points.length >= 3) {
      const polygonAnnotation = {
        imageId: currentImageId.value,
        classId: selectedClassId.value,
        type: 'polygon' as const,
        coordinates: [...drawingState.value.points],
      }

      createAnnotation(polygonAnnotation)
    } else if (tool === 'keypoint') {
      const keypointAnnotation = {
        imageId: currentImageId.value,
        classId: selectedClassId.value,
        type: 'keypoint' as const,
        coordinates: drawingState.value.points.map((p) => ({ x: p.x, y: p.y, visible: true })),
      }

      createAnnotation(keypointAnnotation)
    } else if (tool === 'classification') {
      const classificationAnnotation = {
        imageId: currentImageId.value,
        classId: selectedClassId.value,
        type: 'classification' as const,
      }

      createAnnotation(classificationAnnotation)
    }

    resetDrawingState()
  }

  function cancelDrawing(): void {
    resetDrawingState()
  }

  function resetDrawingState(): void {
    drawingState.value.isDrawing = false
    drawingState.value.points = []
    drawingState.value.startPoint = null
    drawingState.value.temporaryAnnotation = null
  }

  function selectClass(classId: number): void {
    selectedClassId.value = classId
  }

  function selectAnnotation(annotationId: number | null): void {
    selectedAnnotationId.value = annotationId
  }

  // Reset state when changing image or project
  function resetState(): void {
    annotations.value = []
    selectedAnnotationId.value = null
    currentImageId.value = null
    resetDrawingState()
    loading.value = false
    error.value = null
    history.value = []
    historyIndex.value = -1
  }

  return {
    // State
    annotations,
    selectedAnnotationId,
    selectedClassId,
    currentImageId,
    drawingState,
    classes,
    loading,
    error,
    history,
    historyIndex,

    // Getters
    selectedAnnotation,
    selectedClass,
    getClassById,
    canUndo,
    canRedo,

    // Actions
    fetchAnnotations,
    fetchClasses,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    setCurrentTool,
    startDrawing,
    updateDrawing,
    addPoint,
    finishDrawing,
    cancelDrawing,
    resetDrawingState,
    selectClass,
    selectAnnotation,
    resetState,
    undo,
    redo,
  }
})
