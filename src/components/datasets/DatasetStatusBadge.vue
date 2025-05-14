<template>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass">
        <span class="relative flex h-2 w-2 mr-1">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="pingClass"></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="pingClass"></span>
        </span>
        {{ formatStatus(status) }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    status: 'pending' | 'generating' | 'completed' | 'failed';
}>();

const statusClass = computed(() => {
    switch (props.status) {
        case 'pending':
            return 'bg-gray-100 text-gray-800';
        case 'generating':
            return 'bg-blue-100 text-blue-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
});

const pingClass = computed(() => {
    switch (props.status) {
        case 'pending':
            return 'bg-gray-400';
        case 'generating':
            return 'bg-blue-400';
        case 'completed':
            return 'bg-green-400';
        case 'failed':
            return 'bg-red-400';
        default:
            return 'bg-gray-400';
    }
});

const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};
</script>