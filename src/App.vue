<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Initialize auth state on load
authStore.checkAuth();

</script>

<style></style>