<template>
  <div :class="['p-6 pt-0', props.class]" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
