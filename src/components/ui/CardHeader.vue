<template>
  <div :class="['flex flex-col space-y-1.5 p-6', props.class]" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
