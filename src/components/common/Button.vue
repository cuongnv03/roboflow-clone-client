<template>
    <button :type="type" :class="[
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses,
        props.class
    ]" :disabled="disabled || loading">
        <!-- Loading spinner -->
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
        </svg>

        <slot v-if="!loading" />
        <span v-else>{{ loadingText }}</span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (val: string) => ['primary', 'secondary', 'outline', 'danger', 'ghost', 'link'].includes(val)
    },
    size: {
        type: String,
        default: 'default',
        validator: (val: string) => ['sm', 'default', 'lg'].includes(val)
    },
    type: {
        type: String as () => 'button' | 'submit' | 'reset',
        default: 'button',
        validator: (val: string) => ['button', 'submit', 'reset'].includes(val)
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        default: 'Loading...'
    },
    class: {
        type: String,
        default: ''
    }
});

// Computed classes based on variant
const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary':
            return 'bg-brand-purple text-white hover:bg-brand-purple-dark';
        case 'secondary':
            return 'bg-purple-100 text-brand-purple hover:bg-purple-200';
        case 'outline':
            return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
        case 'danger':
            return 'bg-red-600 text-white hover:bg-red-700';
        case 'ghost':
            return 'bg-transparent hover:bg-gray-100 text-gray-700';
        case 'link':
            return 'bg-transparent underline text-brand-purple hover:text-brand-purple-dark';
        default:
            return 'bg-brand-purple text-white hover:bg-brand-purple-dark';
    }
});

// Computed classes based on size
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'h-8 px-3 text-xs';
        case 'lg':
            return 'h-11 px-6 text-base';
        default:
            return 'h-10 px-4 py-2';
    }
});
</script>