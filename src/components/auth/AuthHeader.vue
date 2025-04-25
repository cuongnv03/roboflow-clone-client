<template>
  <div class="flex flex-col items-center mb-8">
    <router-link :to="{ name: 'home' }" class="flex justify-center items-center m-0">
      <img src="/images/logo.png" alt="Roboflow Clone" class="w-3/5 h-3/5 mb-4">
    </router-link>

    <p class="text-gray-500">
      <span @click="$emit('set-mode', false)" class="cursor-pointer px-2 py-1 rounded"
        :class="{ 'text-brand-purple font-semibold bg-purple-100': !isSignUp }">Sign In</span>
      <span class="mx-1">or</span>
      <span @click="$emit('set-mode', true)" class="cursor-pointer px-2 py-1 rounded"
        :class="{ 'text-brand-purple font-semibold bg-purple-100': isSignUp }">Sign Up</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  isSignUp: boolean;
}>();

const emit = defineEmits(['set-mode']);
</script>
