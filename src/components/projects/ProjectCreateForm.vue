<template>
  <div class="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
    <h2 class="text-xl font-semibold mb-4">New Project Details</h2>
    <div v-if="createError"
      class="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center"> {{
        createError }} </div>
    <form @submit.prevent="handleCreateProject" class="space-y-4">
      <div>
        <label for="projectName" class="block text-sm font-medium text-gray-700">Project Name</label>
        <input type="text" id="projectName" v-model="newProject.name" required class="mt-1 block w-full input-field" />
      </div>
      <div>
        <label for="projectDesc" class="block text-sm font-medium text-gray-700">Description
          (Optional)</label>
        <textarea id="projectDesc" v-model="newProject.description" rows="3"
          class="mt-1 block w-full input-field"></textarea>
      </div>
      <div>
        <label for="projectType" class="block text-sm font-medium text-gray-700">Project Type</label>
        <select id="projectType" v-model="newProject.type" required class="mt-1 block w-full input-field">
          <option disabled value="">Please select one</option>
          <option v-for="ptype in allowedProjectTypes" :key="ptype" :value="ptype">{{
            formatProjectType(ptype) }}</option>
        </select>
      </div>
      <div class="flex justify-end">
        <button type="submit" :disabled="isLoading" class="btn btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
          {{ isLoading ? 'Creating...' : 'Create Project' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits, toRefs } from 'vue';
import { allowedProjectTypes, type ProjectType } from '@/types/projectTypes';

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const { isLoading } = toRefs(props);
const emit = defineEmits(['create']);

const createError = ref<string | null>(null);
const newProject = reactive({ name: '', description: '', type: '' as ProjectType | '' });

const formatProjectType = (type: string | undefined) => {
  if (!type) return 'N/A';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const handleCreateProject = async () => {
  createError.value = null;
  if (!newProject.name || !newProject.type) {
    createError.value = "Project Name and Type are required.";
    return;
  }
  emit('create', {
    name: newProject.name,
    description: newProject.description || null,
    type: newProject.type as ProjectType,
  });
};
</script>

<style scoped>
.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-purple focus:ring focus:ring-brand-purple focus:ring-opacity-50 sm:text-sm;
}
</style>
