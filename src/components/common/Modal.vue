<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
                <!-- Background overlay -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    @click="closeOnOutsideClick && $emit('update:modelValue', false)"></div>

                <!-- Modal panel -->
                <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:align-middle"
                        :class="[sizeClass, props.class]" @click.stop>
                        <!-- Header -->
                        <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 v-if="title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
                                <slot v-else name="header"></slot>

                                <button v-if="showClose" @click="$emit('update:modelValue', false)" type="button"
                                    class="text-gray-400 hover:text-gray-500 focus:outline-none">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
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
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

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
        default: 'md',
        validator: (val: string) => ['sm', 'md', 'lg', 'xl', 'full'].includes(val)
    },
    closeOnOutsideClick: {
        type: Boolean,
        default: true
    },
    showClose: {
        type: Boolean,
        default: true
    },
    class: {
        type: String,
        default: ''
    }
});

defineEmits(['update:modelValue']);

// Computed size class
const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'sm:max-w-sm';
        case 'lg': return 'sm:max-w-lg';
        case 'xl': return 'sm:max-w-xl';
        case 'full': return 'sm:max-w-full sm:mx-4';
        default: return 'sm:max-w-md';
    }
});

// Lock body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        document.body.classList.add('overflow-hidden');
    } else {
        document.body.classList.remove('overflow-hidden');
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