<template>
  <RouterView />
  <Notification
    :visible="toast.state.visible"
    :message="toast.state.message"
    :type="toast.state.type"
    :duration="toast.state.duration"
    @close="toast.close()"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Notification from '@/components/common/Notification.vue';
import { useToast } from '@/composables/useToast';

const authStore = useAuthStore();
const toast = useToast();

onMounted(() => {
  authStore.checkAuth();
});
</script>