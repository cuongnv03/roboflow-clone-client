<template>
    <Teleport to="body">
        <transition name="modal-fade">
            <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto"
                @click="closeOnBgClick && $emit('update:modelValue', false)">
                <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Background overlay -->
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                    <!-- Modal panel -->
                    <div @click.stop
                        class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
                        :class="props.size === 'lg' ? 'sm:max-w-2xl' : props.size === 'xl' ? 'sm:max-w-4xl' : 'sm:max-w-lg'">
                        <!-- Header -->
                        <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 v-if="title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
                                <slot v-else name="header"></slot>
                                <button v-if="showClose" @click="$emit('update:modelValue', false)" type="button"
                                    class="text-gray-400 hover:text-gray-500">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Body -->
                        <div class="px-6 py-4">
                            <slot></slot>
                        </div>

                        <!-- Footer -->
                        <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <slot name="footer"></slot>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'default',
        validator: (val: string) => ['default', 'lg', 'xl'].includes(val)
    },
    closeOnBgClick: {
        type: Boolean,
        default: true
    },
    showClose: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);

// Manage body scroll locking when modal is open
watch(() => props.modelValue, (value) => {
    if (value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}, { immediate: true });
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .inline-block,
.modal-fade-leave-active .inline-block {
    transition: all 0.3s ease;
}

.modal-fade-enter-from .inline-block,
.modal-fade-leave-to .inline-block {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
}
</style>