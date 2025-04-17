<template>
  <label :for="for" class="text-sm font-medium text-gray-700">
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{ for?: string }>()
</script>
