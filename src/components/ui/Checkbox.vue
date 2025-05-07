<template>
  <div class="flex items-center">
    <input type="checkbox" :id="id" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" v-bind="$attrs" />
    <label v-if="label" :for="id" class="ml-2 block text-sm text-gray-700">
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`
  }
});

defineEmits(['update:modelValue']);
</script>