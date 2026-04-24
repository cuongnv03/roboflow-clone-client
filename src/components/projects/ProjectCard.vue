<template>
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div class="p-5">
            <h3 class="text-lg font-semibold text-gray-800 mb-1 truncate">{{ project.name }}</h3>
            <p class="text-sm text-gray-500 mb-2 capitalize">{{ formatProjectType(project.type) }}</p>

            <!-- Stats row -->
            <div v-if="stats" class="flex items-center space-x-3 mb-3">
                <span class="text-xs text-gray-500">
                    {{ stats.totalImages }} image{{ stats.totalImages !== 1 ? 's' : '' }}
                </span>
                <span class="text-gray-300 text-xs">·</span>
                <span class="text-xs font-medium" :class="annotatedPct === 100 ? 'text-green-600' : 'text-gray-500'">
                    {{ annotatedPct }}% annotated
                </span>
                <span v-if="stats.totalImages > 0" class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full transition-all"
                        :style="`width: ${annotatedPct}%`"></div>
                </span>
            </div>
            <div v-else class="mb-3 h-4"></div>

            <p class="text-sm text-gray-600 line-clamp-2 h-10">
                {{ project.description || 'No description provided.' }}
            </p>
        </div>

        <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <div class="flex space-x-2">
                <button @click="$emit('edit', project)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Edit
                </button>
                <span class="text-gray-300">|</span>
                <button @click="$emit('delete', project.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium">
                    Delete
                </button>
            </div>

            <router-link :to="{ name: 'project-upload', params: { projectId: project.id } }"
                class="btn btn-outline text-sm py-1 px-3">
                Open
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Project, ProjectStats } from '@/types/project';

const props = defineProps<{
    project: Project;
    stats?: ProjectStats;
}>();

defineEmits(['edit', 'delete']);

const annotatedPct = computed(() => {
    if (!props.stats || props.stats.totalImages === 0) return 0;
    return Math.round((props.stats.annotatedImages / props.stats.totalImages) * 100);
});

const formatProjectType = (type: string | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>