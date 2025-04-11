<!-- src/components/ui/CardTitle.vue -->
<template>
  <h3
    :class="['text-2xl font-semibold leading-none tracking-tight', props.class]"
    v-bind="$attrs"
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
