<template>
  <div :class="badgeClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  class?: string
}>()

const badgeClass = computed(() =>
  [
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    props.variant === 'default' &&
    'bg-primary text-primary-foreground border-transparent hover:bg-primary/80',
    props.variant === 'secondary' &&
    'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
    props.variant === 'destructive' &&
    'bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/80',
    props.variant === 'outline' && 'text-foreground',
    props.class,
  ]
    .filter(Boolean)
    .join(' ')
)
</script>
