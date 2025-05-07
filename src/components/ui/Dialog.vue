<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
        aria-modal="true" role="dialog">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="closeOnOutsideClick && $emit('update:modelValue', false)"></div>

        <!-- Dialog Panel -->
        <div class="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all z-10"
          :class="[sizeClass, props.class]">
          <!-- Close Button -->
          <button v-if="showClose" type="button" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            @click="$emit('update:modelValue', false)" aria-label="Close">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div v-if="$slots.header || title" class="mb-4">
            <slot name="header">
              <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            </slot>
          </div>

          <!-- Body -->
          <div>
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="mt-6">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val: string) => ['sm', 'md', 'lg', 'xl', 'full'].includes(val)
  },
  closeOnOutsideClick: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  class: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

// Computed class for dialog size
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case 'full': return 'max-w-full';
    default: return 'max-w-md';
  }
});

// Prevent body scrolling when dialog is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
}, { immediate: true });
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .relative,
.dialog-fade-leave-to .relative {
  transform: scale(0.95);
}
</style>