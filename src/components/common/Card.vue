<template>
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" :class="props.class">
        <div v-if="slots.header || title" class="px-6 py-4 border-b border-gray-200">
            <slot name="header">
                <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            </slot>
        </div>

        <div :class="contentClass">
            <slot></slot>
        </div>

        <div v-if="slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    noPadding: {
        type: Boolean,
        default: false
    },
    class: {
        type: String,
        default: ''
    }
});

// Get slots using the useSlots composable
const slots = useSlots();

const contentClass = computed(() => {
    if (props.noPadding) {
        return '';
    }

    const hasHeader = props.title || !!slots.header;
    const hasFooter = !!slots.footer;

    if (!hasHeader && !hasFooter) {
        return 'p-6';
    }

    return 'px-6 py-4';
});
</script>