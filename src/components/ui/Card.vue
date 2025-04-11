<!-- src/components/ui/Card.vue -->
<template>
  <div :class="['rounded-lg border bg-card text-card-foreground shadow-sm', props.class]" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
