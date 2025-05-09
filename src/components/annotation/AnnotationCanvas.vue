<template>
    <div class="relative w-full h-full" ref="containerRef">
        <!-- Main canvas for image display -->
        <canvas ref="imageCanvasRef" class="absolute top-0 left-0 w-full h-full"></canvas>

        <!-- Overlay canvas for annotations -->
        <canvas ref="annotationCanvasRef" class="absolute top-0 left-0 w-full h-full"></canvas>

        <!-- Canvas for brush/eraser tools -->
        <canvas ref="brushCanvas" class="absolute top-0 left-0 w-full h-full"></canvas>

        <!-- Drawing canvas (top layer) -->
        <canvas ref="drawingCanvasRef" class="absolute top-0 left-0 w-full h-full cursor-crosshair"
            @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseLeave"
            @click="onClick" @contextmenu.prevent="onRightClick"></canvas>

        <!-- Loading overlay -->
        <div v-if="loading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="text-white flex items-center">
                <svg class="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                Loading...
            </div>
        </div>

        <!-- Tool guides and helpers -->
        <div v-if="annotationStore.drawingState.currentTool === 'polygon' && annotationStore.drawingState.points.length > 0"
            class="absolute left-0 top-0 text-xs bg-black bg-opacity-70 text-white p-1 rounded-br-md">
            Click to add points. Right-click or double-click last point to finish polygon.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useAnnotationStore } from '@/stores/annotation';
import type { Annotation, AnnotationType } from '@/types/annotation';
import { useMouseInElement } from '@vueuse/core';

const props = defineProps<{
    image: {
        id: number;
        filePath: string;
        width: number;
        height: number;
    };
    projectType: string;
    loading: boolean;
    toolSettings: object;
}>();

// Refs for canvas elements
const containerRef = ref<HTMLDivElement | null>(null);
const imageCanvasRef = ref<HTMLCanvasElement | null>(null);
const annotationCanvasRef = ref<HTMLCanvasElement | null>(null);
const drawingCanvasRef = ref<HTMLCanvasElement | null>(null);
const brushContext = ref(null);
const brushCanvas = ref(null);
const magicWandSeedPoint = ref(null);

// Stores
const annotationStore = useAnnotationStore();

// Local state
const scale = ref(1);
const offset = ref({ x: 0, y: 0 });
const imageElement = ref<HTMLImageElement | null>(null);
const imageLoaded = ref(false);
const isDrawing = ref(false);

// Canvas setup
onMounted(() => {
    // Thiết lập các canvas hiện có
    loadImage();
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Thiết lập brush canvas
    setupBrushCanvas();

    // Fetch annotations
    if (props.image) {
        annotationStore.fetchAnnotations(props.image.id);
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
});

// Watch for changes in annotations and redraw
watch(() => annotationStore.annotations, () => {
    drawAnnotations();
}, { deep: true });

// Watch for changes in selected annotation
watch(() => annotationStore.selectedAnnotationId, () => {
    drawAnnotations();
});

// Watch for changes in drawing state
watch(() => annotationStore.drawingState, () => {
    drawTemporaryAnnotation();
}, { deep: true });

// Watch for image change
watch(() => props.image, () => {
    loadImage();
    annotationStore.fetchAnnotations(props.image.id);
}, { deep: true });

// Load image and set up canvas
function loadImage() {
    imageLoaded.value = false;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = props.image.filePath;

    img.onload = () => {
        imageElement.value = img;
        imageLoaded.value = true;
        resizeCanvas();
        drawImage();
    };

    img.onerror = (err) => {
        console.error('Error loading image:', err);
    };
}

// Resize canvas to fit container
function resizeCanvas() {
    if (!containerRef.value) return;

    const container = containerRef.value;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Thiết lập kích thước các canvas
    const canvases = [
        imageCanvasRef.value,
        annotationCanvasRef.value,
        drawingCanvasRef.value,
        brushCanvas.value
    ];

    canvases.forEach(canvas => {
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    });

    if (imageLoaded.value) {
        calculateScale();
        drawImage();
        drawAnnotations();
        drawTemporaryAnnotation();
    }
}

// Calculate scale and offset for image to fit canvas
function calculateScale() {
    if (!containerRef.value || !imageElement.value) return;

    const container = containerRef.value;
    const img = imageElement.value;

    const containerRatio = container.clientWidth / container.clientHeight;
    const imageRatio = img.width / img.height;

    if (containerRatio > imageRatio) {
        // Container is wider than image
        scale.value = container.clientHeight / img.height;
        offset.value = {
            x: (container.clientWidth - img.width * scale.value) / 2,
            y: 0
        };
    } else {
        // Container is taller than image
        scale.value = container.clientWidth / img.width;
        offset.value = {
            x: 0,
            y: (container.clientHeight - img.height * scale.value) / 2
        };
    }
}

// Draw image on canvas
function drawImage() {
    if (!imageElement.value || !imageCanvasRef.value) return;

    const canvas = imageCanvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const img = imageElement.value;
    ctx.drawImage(
        img,
        offset.value.x,
        offset.value.y,
        img.width * scale.value,
        img.height * scale.value
    );
}

// Convert canvas coordinates to image coordinates
function canvasToImageCoordinates(x: number, y: number): { x: number; y: number } {
    return {
        x: Math.max(0, Math.min(props.image.width, (x - offset.value.x) / scale.value)),
        y: Math.max(0, Math.min(props.image.height, (y - offset.value.y) / scale.value))
    };
}

// Convert image coordinates to canvas coordinates
function imageToCanvasCoordinates(x: number, y: number): { x: number; y: number } {
    return {
        x: x * scale.value + offset.value.x,
        y: y * scale.value + offset.value.y
    };
}

// Draw annotations on canvas
function drawAnnotations() {
    if (!annotationCanvasRef.value) return;

    const canvas = annotationCanvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each annotation
    annotationStore.annotations.forEach(annotation => {
        const isSelected = annotation.id === annotationStore.selectedAnnotationId;
        const classObj = annotationStore.getClassById(annotation.classId);
        const color = classObj?.color || '#000000';

        drawAnnotation(ctx, annotation, color, isSelected);
    });
}

// Draw a single annotation
function drawAnnotation(
    ctx: CanvasRenderingContext2D,
    annotation: Annotation,
    color: string,
    isSelected: boolean
) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.lineWidth = isSelected ? 3 : 2;

    if (annotation.type === 'bbox') {
        const { x, y, width, height } = annotation.coordinates;
        const canvasCoords = imageToCanvasCoordinates(x, y);

        // Draw rectangle
        ctx.beginPath();
        ctx.rect(
            canvasCoords.x,
            canvasCoords.y,
            width * scale.value,
            height * scale.value
        );
        ctx.stroke();
        ctx.fill();

        // Draw label above the box
        drawAnnotationLabel(ctx, annotation, canvasCoords.x, canvasCoords.y);

        // Draw resize handles if selected
        if (isSelected) {
            drawResizeHandles(ctx, x, y, width, height);
        }
    } else if (annotation.type === 'polygon') {
        const points = annotation.coordinates;

        // Draw polygon
        ctx.beginPath();
        if (points.length > 0) {
            const firstPoint = imageToCanvasCoordinates(points[0].x, points[0].y);
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < points.length; i++) {
                const point = imageToCanvasCoordinates(points[i].x, points[i].y);
                ctx.lineTo(point.x, point.y);
            }

            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Draw label above the polygon
            const labelX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
            const labelY = points.reduce((min, point) => Math.min(min, point.y), Infinity);
            const labelCanvasCoords = imageToCanvasCoordinates(labelX, labelY);
            drawAnnotationLabel(ctx, annotation, labelCanvasCoords.x, labelCanvasCoords.y);

            // Draw points if selected
            if (isSelected) {
                for (const point of points) {
                    const canvasPoint = imageToCanvasCoordinates(point.x, point.y);
                    drawControlPoint(ctx, canvasPoint.x, canvasPoint.y, color);
                }
            }
        }
    } else if (annotation.type === 'keypoint') {
        const points = annotation.coordinates;

        // Draw keypoints
        for (const point of points) {
            const canvasPoint = imageToCanvasCoordinates(point.x, point.y);

            // Draw point
            ctx.beginPath();
            ctx.arc(canvasPoint.x, canvasPoint.y, isSelected ? 8 : 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw label if keypoint has a name
            if (point.name) {
                drawAnnotationLabel(ctx, { ...annotation, className: point.name }, canvasPoint.x, canvasPoint.y - 15);
            }
        }
    }
}

// Draw annotation label
function drawAnnotationLabel(
    ctx: CanvasRenderingContext2D,
    annotation: Annotation & { className?: string },
    x: number,
    y: number
) {
    const classObj = annotationStore.getClassById(annotation.classId);
    const color = classObj?.color || '#000000';
    const className = annotation.className || classObj?.name || '';

    if (!className) return;

    // Add padding above the box for the label
    const labelY = y - 8;

    // Draw label background
    ctx.font = '12px Arial';
    const textWidth = ctx.measureText(className).width;
    const padding = 3;

    ctx.fillStyle = color;
    ctx.fillRect(x - padding, labelY - 14, textWidth + padding * 2, 18);

    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(className, x, labelY);
}

// Draw resize handles for bounding box
function drawResizeHandles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const handleSize = 8;

    // Calculate the eight handle positions
    const handles = [
        { x, y }, // top-left
        { x: x + width / 2, y }, // top-center
        { x: x + width, y }, // top-right
        { x, y: y + height / 2 }, // middle-left
        { x: x + width, y: y + height / 2 }, // middle-right
        { x, y: y + height }, // bottom-left
        { x: x + width / 2, y: y + height }, // bottom-center
        { x: x + width, y: y + height } // bottom-right
    ];

    // Draw handles
    for (const handle of handles) {
        const canvasCoords = imageToCanvasCoordinates(handle.x, handle.y);

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(
            canvasCoords.x - handleSize / 2,
            canvasCoords.y - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.fill();
        ctx.stroke();
    }
}

// Draw control point for polygon
function drawControlPoint(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
) {
    const radius = 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// Draw temporary annotation during drawing
function drawTemporaryAnnotation() {
    if (!drawingCanvasRef.value) return;

    const canvas = drawingCanvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get drawing state
    const { isDrawing, currentTool, points, temporaryAnnotation } = annotationStore.drawingState;

    if (!isDrawing || !currentTool) return;

    // Get color from selected class
    const classObj = annotationStore.selectedClass;
    const color = classObj?.color || '#000000';

    ctx.strokeStyle = color;
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.lineWidth = 2;

    if (currentTool === 'bbox' && points.length >= 2) {
        // Draw a rectangle from start point to current point
        const startPoint = imageToCanvasCoordinates(points[0].x, points[0].y);
        const currentPoint = imageToCanvasCoordinates(points[1].x, points[1].y);

        ctx.beginPath();
        const rectX = Math.min(startPoint.x, currentPoint.x);
        const rectY = Math.min(startPoint.y, currentPoint.y);
        const rectWidth = Math.abs(currentPoint.x - startPoint.x);
        const rectHeight = Math.abs(currentPoint.y - startPoint.y);

        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.stroke();
        ctx.fill();
    } else if (currentTool === 'polygon' && points.length > 0) {
        // Draw polygon with the current points
        ctx.beginPath();

        const firstPoint = imageToCanvasCoordinates(points[0].x, points[0].y);
        ctx.moveTo(firstPoint.x, firstPoint.y);

        // Draw lines between points
        for (let i = 1; i < points.length; i++) {
            const point = imageToCanvasCoordinates(points[i].x, points[i].y);
            ctx.lineTo(point.x, point.y);
        }

        // If we have more than 2 points, close the polygon
        if (points.length > 2) {
            ctx.closePath();
        }

        ctx.stroke();
        ctx.fill();

        // Draw points
        for (const point of points) {
            const canvasPoint = imageToCanvasCoordinates(point.x, point.y);
            drawControlPoint(ctx, canvasPoint.x, canvasPoint.y, color);
        }

        // Draw a line from the last point to the mouse position
        if (points.length > 0) {
            const lastPoint = imageToCanvasCoordinates(points[points.length - 1].x, points[points.length - 1].y);
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);

            // If we have a current mouse position, draw to it
            if (currentMousePos.value) {
                ctx.lineTo(currentMousePos.value.x, currentMousePos.value.y);
                ctx.stroke();
            }
        }
    } else if (currentTool === 'keypoint' && points.length > 0) {
        // Draw keypoint
        const point = imageToCanvasCoordinates(points[0].x, points[0].y);

        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

function setupBrushCanvas() {
    if (!brushCanvas.value) return;

    const canvas = brushCanvas.value;
    brushContext.value = canvas.getContext('2d');

    // Reset kích thước canvas
    canvas.width = containerRef.value?.clientWidth || 0;
    canvas.height = containerRef.value?.clientHeight || 0;
}

function drawWithBrush(x: number, y: number) {
    if (!brushContext.value || !props.toolSettings) return;

    const ctx = brushContext.value;
    const toolType = annotationStore.drawingState.currentTool;
    const classObj = annotationStore.selectedClass;
    const color = classObj?.color || '#000000';

    // Thiết lập brush
    ctx.lineWidth = props.toolSettings.size || 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolType === 'brush') {
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = 'source-over';
    } else if (toolType === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.globalCompositeOperation = 'destination-out';
    }

    // Nếu đây là điểm đầu tiên, bắt đầu đường mới
    if (!isDrawing.value) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        isDrawing.value = true;
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

// Xử lý magic wand
function useMagicWand(x: number, y: number) {
    if (!imageCanvasRef.value || !props.toolSettings) return;

    // Lưu seed point cho magic wand
    magicWandSeedPoint.value = canvasToImageCoordinates(x, y);

    // Mô phỏng kết quả magic wand (thực tế sẽ phức tạp hơn)
    const tolerance = props.toolSettings.tolerance || 30;
    const contiguous = props.toolSettings.contiguous !== undefined ? props.toolSettings.contiguous : true;

    // TODO: Implement actual magic wand algorithm
    // Phần này sẽ cần một thuật toán flood fill hoặc region growing
    // Có thể sử dụng thư viện như FloodFill hoặc triển khai riêng

    console.log('Magic wand at:', magicWandSeedPoint.value, 'with tolerance:', tolerance, 'contiguous:', contiguous);

    // Sau khi có kết quả, tạo chú thích polygon từ đường viền
    const simulatedPolygon = generateSimulatedPolygon(magicWandSeedPoint.value);

    if (simulatedPolygon.length >= 3) {
        annotationStore.drawingState.points = simulatedPolygon;
        annotationStore.drawingState.temporaryAnnotation = {
            type: 'polygon',
            coordinates: simulatedPolygon
        };

        // Sẵn sàng hoàn tất chú thích khi người dùng xác nhận
        setTimeout(() => {
            if (confirm('Use this selection?')) {
                annotationStore.finishDrawing();
            } else {
                annotationStore.cancelDrawing();
            }
        }, 100);
    }
}

// Mô phỏng tạo polygon từ magic wand (chỉ để minh họa)
function generateSimulatedPolygon(center: { x: number, y: number }) {
    // Tạo một đa giác mô phỏng xung quanh điểm seed
    const radius = Math.min(props.image.width, props.image.height) * 0.1;
    const numPoints = 8 + Math.floor(Math.random() * 8);
    const polygon = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const randomRadius = radius * (0.8 + Math.random() * 0.4);
        polygon.push({
            x: center.x + randomRadius * Math.cos(angle),
            y: center.y + randomRadius * Math.sin(angle)
        });
    }

    return polygon;
}

// Current mouse position for drawing preview
const currentMousePos = ref<{ x: number; y: number } | null>(null);

// Mouse event handlers
function onMouseDown(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Chuyển đổi sang tọa độ ảnh
    const imageCoords = canvasToImageCoordinates(x, y);

    const tool = annotationStore.drawingState.currentTool;

    if (tool === 'brush' || tool === 'eraser') {
        // Bắt đầu vẽ brush
        drawWithBrush(x, y);
    } else if (tool === 'magic_wand') {
        // Sử dụng magic wand
        useMagicWand(x, y);
    } else if (tool === 'bbox' || tool === 'polygon' || tool === 'keypoint') {
        // Sử dụng các công cụ khác như trước
        annotationStore.startDrawing(imageCoords);
    }
}

function onMouseMove(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Lưu vị trí chuột hiện tại
    currentMousePos.value = { x, y };

    const tool = annotationStore.drawingState.currentTool;

    if ((tool === 'brush' || tool === 'eraser') && isDrawing.value) {
        // Tiếp tục vẽ brush
        drawWithBrush(x, y);
    } else if (annotationStore.drawingState.isDrawing) {
        // Cập nhật trạng thái vẽ cho các công cụ khác
        const imageCoords = canvasToImageCoordinates(x, y);
        annotationStore.updateDrawing(imageCoords);
    }
}

function onMouseUp(event: MouseEvent) {
    const tool = annotationStore.drawingState.currentTool;

    if (tool === 'brush' || tool === 'eraser') {
        // Kết thúc vẽ brush
        isDrawing.value = false;

        // Lưu kết quả brush vào chú thích
        if (brushCanvas.value) {
            // Chuyển đổi canvas thành hình ảnh để lưu
            const imageData = brushCanvas.value.toDataURL();

            // Tạo chú thích mới
            // Lưu ý: Phần này phức tạp hơn nhiều trong triển khai thực tế
            // Bạn cần lưu dữ liệu mask hoặc chuyển đổi thành polygon
            console.log('Saving brush stroke:', imageData.slice(0, 100) + '...');

            // Xóa canvas sau khi lưu
            if (brushContext.value) {
                brushContext.value.clearRect(0, 0, brushCanvas.value.width, brushCanvas.value.height);
            }
        }
    } else if (tool === 'bbox' || tool === 'keypoint' || tool === 'classification') {
        // Hoàn tất vẽ các công cụ khác
        annotationStore.finishDrawing();
    }
}

function onMouseLeave() {
    currentMousePos.value = null;

    if (annotationStore.drawingState.isDrawing) {
        const tool = annotationStore.drawingState.currentTool;

        if (tool === 'bbox' || tool === 'keypoint') {
            // Cancel drawing if mouse leaves canvas
            annotationStore.cancelDrawing();
        }
    }
}

function onClick(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to image coordinates
    const imageCoords = canvasToImageCoordinates(x, y);

    const tool = annotationStore.drawingState.currentTool;

    if (tool === 'polygon') {
        // For polygon, add a point and continue drawing
        annotationStore.addPoint(imageCoords);
    } else if (tool === 'keypoint') {
        // For keypoint, add a point and finish
        annotationStore.startDrawing(imageCoords);
        annotationStore.finishDrawing();
    }
}

function onRightClick() {
    const tool = annotationStore.drawingState.currentTool;

    if (tool === 'polygon' && annotationStore.drawingState.points.length >= 3) {
        // Finish polygon on right click
        annotationStore.finishDrawing();
    } else {
        // Cancel drawing for other tools
        annotationStore.cancelDrawing();
    }
}
</script>