<template>
    <form class="w-full" @submit.prevent="handleSubmit">
        <div class="p-2">
            <div class="relative mb-10">
                <input type="email" id="signup-email" v-model="formData.email" required autocomplete="email"
                    class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                    placeholder=" " />
                <label for="signup-email"
                    class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                    Email
                </label>
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
            </div>

            <div class="relative mb-10">
                <input type="text" id="signup-username" v-model="formData.username" required
                    class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                    placeholder=" " />
                <label for="signup-username"
                    class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                    Username
                </label>
                <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
            </div>

            <div class="relative mb-10">
                <input type="password" id="signup-password" v-model="formData.password" required
                    autocomplete="new-password" minlength="6"
                    class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                    placeholder=" " />
                <label for="signup-password"
                    class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                    Password (min 6 chars)
                </label>
                <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
            </div>

            <div class="relative mb-10">
                <input type="password" id="signup-confirm-password" v-model="formData.confirmPassword" required
                    autocomplete="new-password"
                    class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                    placeholder=" " />
                <label for="signup-confirm-password"
                    class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                    Confirm Password
                </label>
                <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">{{ errors.confirmPassword }}</p>
            </div>

            <div class="flex justify-end space-x-2 mt-9">
                <button type="button" @click="$emit('cancel')" class="btn btn-outline py-2 px-6">
                    Cancel
                </button>
                <button type="submit" :disabled="isLoading" class="btn btn-primary py-2 px-6"
                    :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
                    {{ isLoading ? 'Creating account...' : 'Submit' }}
                </button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { reactive, defineProps, defineEmits } from 'vue';

interface FormErrors {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    [key: string]: string;
}

const props = defineProps<{
    isLoading: boolean;
    errors: FormErrors;
}>();

const emit = defineEmits(['submit', 'cancel']);

const formData = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
});

const handleSubmit = () => {
    emit('submit', { ...formData });
};
</script>

<style scoped>
/* Styles for the floating label effect - same as LoginForm */
input:focus~label,
input:not(:placeholder-shown)~label {
    --tw-translate-y: -0.80rem;
    --tw-scale-x: .75;
    --tw-scale-y: .75;
    color: #9333ea;
}

input:focus~label,
input:not(:placeholder-shown)~label {
    background-color: #fff;
    padding-left: 0.125rem;
    padding-right: 0.125rem;
}

input:focus {
    border-bottom-width: 2px;
}
</style>