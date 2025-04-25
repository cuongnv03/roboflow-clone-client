<template>
  <div v-if="message"
    class="w-full mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  message: string | null;
}>();
</script>

