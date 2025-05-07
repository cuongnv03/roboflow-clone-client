<template>
  <span :class="[
    'inline-flex items-center justify-center rounded-full text-xs font-medium',
    variantClass,
    sizeClass,
    props.class
  ]" v-bind="$attrs">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (val: string) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(val)
  },
  size: {
    type: String,
    default: 'default',
    validator: (val: string) => ['sm', 'default', 'lg'].includes(val)
  },
  class: {
    type: String,
    default: ''
  }
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-brand-purple text-white';
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-1.5 py-0.5 text-xs';
    case 'lg':
      return 'px-3 py-1 text-sm';
    default:
      return 'px-2 py-0.5 text-xs';
  }
});
</script>