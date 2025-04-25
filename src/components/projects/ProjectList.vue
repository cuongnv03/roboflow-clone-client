<template>
  <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProjectItem v-for="project in projects" :key="project.project_id" :project="project" @edit="openEditModal"
      @delete="confirmDeleteProject" />
  </div>
  <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
    <p class="text-gray-500">You don't have any projects yet.</p>
    <button @click="$emit('create')" class="btn btn-primary mt-4">
      Create Your First Project
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, toRefs } from 'vue';
import type { ProjectDb } from '@/types/express/index.d';
import ProjectItem from './ProjectItem.vue';

const props = defineProps({
  projects: {
    type: Array<ProjectDb>,
    required: true,
  },
});

const { projects } = toRefs(props);
const emit = defineEmits(['create', 'edit', 'delete']);

const openEditModal = (project: ProjectDb) => {
  emit('edit', project);
};

const confirmDeleteProject = (projectId: number, projectName: string) => {
  emit('delete', projectId, projectName);
};
</script>
