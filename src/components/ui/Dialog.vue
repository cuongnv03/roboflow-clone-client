<template>
  <Teleport to="body">
    <transition name="dialog-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @keydown.esc="emit('update:modelValue', false)"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black/70 transition-opacity"
          @click="emit('update:modelValue', false)"
        />

        <!-- Dialog content -->
        <div
          class="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
          @click.stop
          ref="dialogRef"
        >
          <slot />
          <button
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            @click="emit('update:modelValue', false)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const dialogRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  document.body.style.overflow = props.modelValue ? 'hidden' : ''
})
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
