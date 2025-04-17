<template>
  <button :class="buttonClasses" v-bind="$attrs" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
  disabled?: boolean
}>()

const buttonClasses = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    props.variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
    props.variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    props.variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    props.variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    props.variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
    props.variant === 'link' && 'text-primary underline-offset-4 hover:underline',
    props.size === 'default' && 'h-10 px-4 py-2',
    props.size === 'sm' && 'h-9 rounded-md px-3',
    props.size === 'lg' && 'h-11 rounded-md px-8',
    props.size === 'icon' && 'h-10 w-10',
    props.class
  )
)
</script>
