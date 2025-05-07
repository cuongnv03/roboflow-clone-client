<template>
  <button :class="[
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple',
    sizeClasses,
    variantClasses,
    props.class
  ]" :disabled="disabled" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (val: string) => ['primary', 'outline', 'ghost', 'link', 'danger'].includes(val)
  },
  size: {
    type: String,
    default: 'default',
    validator: (val: string) => ['sm', 'default', 'lg', 'icon'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  class: {
    type: String,
    default: ''
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-brand-purple hover:bg-brand-purple-dark text-white border border-transparent';
    case 'outline':
      return 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50';
    case 'ghost':
      return 'bg-transparent hover:bg-gray-100 text-gray-700 border-0';
    case 'link':
      return 'bg-transparent underline text-brand-purple hover:text-brand-purple-dark border-0 p-0 h-auto';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white border border-transparent';
    default:
      return 'bg-brand-purple hover:bg-brand-purple-dark text-white border border-transparent';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 px-3 text-xs';
    case 'lg':
      return 'h-11 px-6 text-base';
    case 'icon':
      return 'h-10 w-10 p-2';
    default:
      return 'h-10 px-4 py-2 text-sm';
  }
});
</script>