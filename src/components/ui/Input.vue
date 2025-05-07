<template>
  <div :class="props.containerClass">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input :id="inputId" :type="type" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" :placeholder="placeholder"
        :disabled="disabled" :required="required" :class="[
          'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
          error ? 'border-red-500' : 'border-gray-300',
          props.class
        ]" v-bind="$attrs" />
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="helpText" class="mt-1 text-xs text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>