<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" :class="props.class">
    <div v-if="$slots.header" class="border-b border-gray-200 px-6 py-4">
      <slot name="header"></slot>
    </div>
    <div :class="[!$slots.header && !$slots.footer ? 'p-6' : 'px-6 py-4']">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="border-t border-gray-200 px-6 py-4 bg-gray-50">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>