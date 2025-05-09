<template>
    <Transition name="notification">
        <div v-if="show"
            class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm flex items-center">
            <component :is="icon" class="h-5 w-5 mr-2" />
            <span>{{ message }}</span>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import * as Icons from '../annotation/icons';

const props = defineProps<{
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    visible: boolean;
}>();

const emit = defineEmits(['close']);

const show = ref(false);
const timeout = ref<number | null>(null);

const icon = computed(() => {
    switch (props.type) {
        case 'success':
            return Icons.CheckIcon;
        case 'warning':
            return Icons.AlertIcon;
        case 'error':
            return Icons.XCircleIcon;
        default:
            return Icons.InfoIcon;
    }
});

watch(() => props.visible, (newVal) => {
    if (newVal) {
        show.value = true;
        if (timeout.value) clearTimeout(timeout.value);

        if (props.duration !== 0) {
            timeout.value = window.setTimeout(() => {
                show.value = false;
                emit('close');
            }, props.duration || 3000);
        }
    } else {
        show.value = false;
    }
});

onMounted(() => {
    if (props.visible) {
        show.value = true;

        if (props.duration !== 0) {
            timeout.value = window.setTimeout(() => {
                show.value = false;
                emit('close');
            }, props.duration || 3000);
        }
    }
});
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.notification-enter-from,
.notification-leave-to {
    opacity: 0;
    transform: translate(-50%, 20px);
}
</style>