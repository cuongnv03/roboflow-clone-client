<template>
    <teleport to="body">
        <transition name="modal-fade">
            <div v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
                @click.self="closeModal">
                <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl m-4">
                    <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                        <h3 class="text-xl font-semibold text-gray-800">
                            <slot name="header">Default Header</slot>
                        </h3>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="h-6 w-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="mb-6">
                        <slot name="body">Default body</slot>
                    </div>

                    <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
                        <slot name="footer">
                            <button @click="closeModal" class="btn btn-outline">Cancel</button>
                            <button @click="confirmAction" class="btn btn-primary">OK</button>
                        </slot>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, onMounted, onUnmounted } from 'vue';

// Props: use v-model for visibility control
const props = defineProps({
    modelValue: { // Allows using v-model="showModal"
        type: Boolean,
        required: true,
    },
});

// Emits: update modelValue and optional confirm event
const emit = defineEmits(['update:modelValue', 'confirm']);

// Close modal function
const closeModal = () => {
    emit('update:modelValue', false);
};

// Confirm action function
const confirmAction = () => {
    emit('confirm');
};

// Handle Escape key press to close modal
const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.modelValue) {
        closeModal();
    }
};

// Add/remove Escape key listener
onMounted(() => {
    document.addEventListener('keydown', handleEsc);
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleEsc);
});

// Watch for modelValue changes to add/remove body class (prevents scrolling)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        document.body.classList.add('overflow-hidden');
    } else {
        document.body.classList.remove('overflow-hidden');
    }
});

// Cleanup body class on unmount
onUnmounted(() => {
    document.body.classList.remove('overflow-hidden');
});

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

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
    transition: all 0.3s ease;
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
    transform: translateY(-20px);
    opacity: 0;
}
</style>