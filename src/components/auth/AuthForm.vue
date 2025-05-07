<template>
    <div class="w-full">
        <AuthHeader :isSignUp="isSignUp" @toggle-mode="toggleMode" />

        <div v-if="errorMessage"
            class="w-full mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
            {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <LoginForm v-if="!isSignUp" :isLoading="isLoading" :errors="formErrors" @submit="handleLogin" />

        <!-- Signup Form -->
        <SignupForm v-else :isLoading="isLoading" :errors="formErrors" @submit="handleSignup" />

        <div class="flex justify-center mt-6">
            <a href="#" class="text-brand-purple text-xs hover:underline">Terms of Service</a>
            <span class="text-gray-400 mx-2 text-xs">•</span>
            <a href="#" class="text-brand-purple text-xs hover:underline">Privacy Policy</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthHeader from './AuthHeader.vue';
import LoginForm from './LoginForm.vue';
import SignupForm from './SignupForm.vue';

// Component state
const isSignUp = ref(false);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const formErrors = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
});

// Store and router
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Toggle between login and signup forms
const toggleMode = (signUp: boolean) => {
    isSignUp.value = signUp;
    errorMessage.value = null;

    // Clear form errors
    Object.keys(formErrors).forEach(key => {
        formErrors[key as keyof typeof formErrors] = '';
    });
};

// Handle login submission
const handleLogin = async (credentials: { email: string; password: string }) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        await authStore.login(credentials.email, credentials.password);

        // Redirect to intended page or dashboard
        const redirectPath = route.query.redirect?.toString() || '/';
        router.push(redirectPath);
    } catch (error: any) {
        if (error.errors) {
            // Handle field-specific errors
            Object.assign(formErrors, error.errors);
        } else {
            // Handle general error
            errorMessage.value = error.message || 'Failed to login. Please check your credentials.';
        }
    } finally {
        isLoading.value = false;
    }
};

// Handle signup submission
const handleSignup = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string
}) => {
    isLoading.value = true;
    errorMessage.value = null;

    // Validate password match
    if (userData.password !== userData.confirmPassword) {
        formErrors.confirmPassword = 'Passwords do not match';
        isLoading.value = false;
        return;
    }

    try {
        await authStore.register(userData.username, userData.email, userData.password);

        // Show success message and switch to login
        errorMessage.value = null;
        isSignUp.value = false;

        // Optional: automatically log in after successful registration
        // await handleLogin({ email: userData.email, password: userData.password });
    } catch (error: any) {
        if (error.errors) {
            // Handle field-specific errors
            Object.assign(formErrors, error.errors);
        } else {
            // Handle general error
            errorMessage.value = error.message || 'Failed to create account. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }
};
</script>