<template>
  <button
    :aria-checked="checked"
    role="checkbox"
    type="button"
    :class="[
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background flex items-center justify-center transition',
      checked ? 'bg-primary text-primary-foreground' : 'bg-white',
      props.class
    ]"
    v-bind="$attrs"
    @click="toggle"
  >
    <Check v-if="checked" class="h-4 w-4" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: boolean
  class?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checked = computed(() => !!props.modelValue)

function toggle() {
  emit('update:modelValue', !checked.value)
}
</script>
