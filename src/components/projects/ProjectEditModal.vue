<template>
  <ModalComponent v-model="show" @confirm="handleUpdateProject">
    <template #header>Edit Project</template>
    <template #body>
      <div v-if="editError"
        class="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
        {{ editError }}
      </div>
      <form id="editProjectForm" @submit.prevent="handleUpdateProject" class="space-y-4">
        <div>
          <label for="editProjectName" class="block text-sm font-medium text-gray-700">Project
            Name</label>
          <input type="text" id="editProjectName" v-model="editingProject.name" required
            class="mt-1 block w-full input-field" />
        </div>
        <div>
          <label for="editProjectDesc" class="block text-sm font-medium text-gray-700">Description
            (Optional)</label>
          <textarea id="editProjectDesc" v-model="editingProject.description" rows="3"
            class="mt-1 block w-full input-field"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Project Type</label>
          <p class="mt-1 text-sm text-gray-500 capitalize">{{ formatProjectType(editingProject.type) }}
          </p>
        </div>
      </form>
    </template>
    <template #footer>
      <button @click="close" class="btn btn-outline">Cancel</button>
      <button type="submit" form="editProjectForm" :disabled="isLoading" class="btn btn-primary"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
        {{ isLoading ? 'Saving...' : 'Save Changes' }}
      </button>
    </template>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits, toRefs, watch } from 'vue';
import type { ProjectDb } from '@/types/express/index.d';
import ModalComponent from '@/components/ModalComponent.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  project: {
    type: Object as () => ProjectDb,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const { show, project, isLoading } = toRefs(props);
const emit = defineEmits(['update', 'close']);

const editError = ref<string | null>(null);
const editingProject = reactive<Partial<ProjectDb>>({
  project_id: undefined,
  name: '',
  description: '',
  type: 'object_detection', // Default or initial type
});

// Initialize editingProject when the component mounts or when the 'project' prop changes
watch(project, (newProject) => {
  editingProject.project_id = newProject.project_id;
  editingProject.name = newProject.name;
  editingProject.description = newProject.description;
  editingProject.type = newProject.type;
}, { immediate: true });

const formatProjectType = (type: string | undefined) => {
  if (!type) return 'N/A';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const handleUpdateProject = async () => {
  editError.value = null;
  if (!editingProject.project_id || !editingProject.name) {
    editError.value = "Project Name cannot be empty.";
    return;
  }
  emit('update', {
    projectId: editingProject.project_id,
    updates: {
      name: editingProject.name,
      description: editingProject.description,
    },
  });
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm;
}
</style>
