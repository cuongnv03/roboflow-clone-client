<template>
  <input
    :type="props.type"
    :class="[
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      props.class
    ]"
    v-bind="$attrs"
    ref="inputRef"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  type?: string
  class?: string
}>()

const inputRef = ref<HTMLInputElement | null>(null)
</script>
