<template>
  <AuthLayout>
    <AuthHeader :isSignUp="isSignUp" @set-mode="setMode" />
    <ErrorMessage :message="errorMessage" />

    <SignInForm v-if="!isSignUp" :isLoading="isLoading" :signInErrors="signInErrors"
      @show-email-form="showSignInForm = true" @submit-sign-in="handleSignIn"
      @cancel-email-form="cancelEmailForm" />

    <SignUpForm v-if="isSignUp" :isLoading="isLoading" :signUpErrors="signUpErrors"
      @submit-sign-up="handleSignUp" @cancel-email-form="cancelEmailForm" />

    <AuthFooter />
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import AuthLayout from '../components/auth/AuthLayout.vue';
import AuthHeader from '../components/auth/AuthHeader.vue';
import SignInForm from '../components/auth/SignInForm.vue';
import SignUpForm from '../components/auth/SignUpForm.vue';
import AuthFooter from '../components/auth/AuthFooter.vue';
import ErrorMessage from '../components/auth/ErrorMessage.vue';

// Store and Router instances
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

interface SignInErrors {
  identifier: string;
  password: string;
}

interface SignUpErrors {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Component State
const showSignInForm = ref(false); // Controls visibility of email/password form for sign-in
const isSignUp = ref(false); // Toggles between Sign In and Sign Up modes/forms
const isLoading = ref(false); // Loading indicator for submit buttons
const errorMessage = ref<string | null>(null); // General error message display
const signInErrors = ref<SignInErrors>({ identifier: '', password: '' });
const signUpErrors = ref<SignUpErrors>({ email: '', username: '', password: '', confirmPassword: '' });

// Mode handling
const setMode = (mode: boolean) => {
  isSignUp.value = mode;
  errorMessage.value = null;
};

// Form handling
const handleSignIn = async (credentials: { identifier: string; password: string }) => {
  isLoading.value = true;
  errorMessage.value = null;
  signInErrors.value = { identifier: '', password: '' };

  try {
    await authStore.login(credentials.identifier, credentials.password);
    router.push('/projects');
  } catch (err: any) {
    if (err.errors) {
      signInErrors.value = err.errors;
    } else {
      errorMessage.value = err.message || 'Failed to sign in';
    }
  } finally {
    isLoading.value = false;
  }
};

const cancelEmailForm = () => {
  showSignInForm.value = false;
  signInErrors.value = { identifier: '', password: '' };
  signUpErrors.value = { email: '', username: '', password: '', confirmPassword: '' };
};

const handleSignUp = async (userData: { email: string; username: string; password: string; confirmPassword: string }) => {
  isLoading.value = true;
  errorMessage.value = null;
  signUpErrors.value = { email: '', username: '', password: '', confirmPassword: '' };

  try {
    await authStore.register(userData.username, userData.email, userData.password);
    router.push('/projects');
  } catch (err: any) {
    if (err.errors) {
      signUpErrors.value = err.errors;
    } else {
      errorMessage.value = err.message || 'Failed to sign up';
    }
  } finally {
    isLoading.value = false;
  }
};

// Sign Up

</script>
