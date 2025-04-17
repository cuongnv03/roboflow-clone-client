<template>
  <p :class="['text-sm text-muted-foreground', props.class]" v-bind="$attrs">
    <slot />
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
