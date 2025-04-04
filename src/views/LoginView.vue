<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-brand-purple">
    <div class="bg-white rounded-lg shadow-xl px-8 sm:px-12 md:px-20 py-10 w-full max-w-md">
      <div class="flex flex-col items-center">
        <router-link :to="{ name: 'home' }" class="flex justify-center items-center m-0">
          <img src="/images/logo.png" alt="Roboflow Clone" class="w-3/5 h-3/5 mb-4">
        </router-link>

        <p class="text-gray-500 mb-8">
          <span @click="setMode(false)" class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'text-brand-purple font-semibold bg-purple-100': !isSignUp }">Sign In</span>
          <span class="mx-1">or</span>
          <span @click="setMode(true)" class="cursor-pointer px-2 py-1 rounded"
            :class="{ 'text-brand-purple font-semibold bg-purple-100': isSignUp }">Sign Up</span>
        </p>

        <div v-if="errorMessage"
          class="w-full mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 text-center">
          {{ errorMessage }}
        </div>

        <div v-if="!isSignUp" class="w-full">
          <div v-if="!showSignInForm" class="w-full space-y-4">
            <button @click="showSignInForm = true" class="btn btn-primary flex items-center justify-center w-full py-3">
              <img class="w-5 h-5 mr-3 filter invert brightness-0" alt="" src="/images/mail.svg">
              Continue with Email (or Username)
            </button>
          </div>

          <form v-if="showSignInForm" class="w-full" @submit.prevent="handleSignIn">
            <div class="p-2">
              <div class="relative mb-10">
                <input type="text" id="signin-identifier" v-model="signInForm.identifier" required
                  class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                  placeholder=" " />
                <label for="signin-identifier"
                  class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                  Email or Username
                </label>
                <p v-if="signInErrors.identifier" class="mt-1 text-xs text-red-600">{{ signInErrors.identifier }}</p>
              </div>

              <div class="relative mb-10">
                <input type="password" id="signin-password" v-model="signInForm.password" required
                  autocomplete="current-password"
                  class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                  placeholder=" " />
                <label for="signin-password"
                  class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                  Password
                </label>
                <p v-if="signInErrors.password" class="mt-1 text-xs text-red-600">{{ signInErrors.password }}</p>
              </div>

              <div class="flex justify-end space-x-2 mt-9">
                <button type="button" @click="cancelEmailForm" class="btn btn-outline py-2 px-6"> Cancel
                </button>
                <button type="submit" :disabled="isLoading" class="btn btn-primary py-2 px-6"
                  :class="{ 'opacity-50 cursor-not-allowed': isLoading }"> {{ isLoading ? 'Signing in...' : 'Submit' }}
                </button>
              </div>
            </div>

            <div class="flex justify-center mt-6">
              <a href="#" class="text-brand-purple text-xs hover:underline">Terms of Service</a>
              <span class="text-gray-400 mx-2 text-xs">•</span>
              <a href="#" class="text-brand-purple text-xs hover:underline">Privacy Policy</a>
            </div>
          </form>

          <p v-if="!showSignInForm" class="text-xs text-gray-500 mt-6 text-center">
            By continuing, you are indicating that you accept our
            <a href="#" class="text-brand-purple hover:underline">Terms of Service</a> and
            <a href="#" class="text-brand-purple hover:underline">Privacy Policy</a>.
          </p>
        </div>

        <form v-if="isSignUp" class="w-full" @submit.prevent="handleSignUp">
          <div class="p-2">
            <div class="relative mb-10">
              <input type="email" id="signup-email" v-model="signUpForm.email" required autocomplete="email"
                class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                placeholder=" " />
              <label for="signup-email"
                class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                Email
              </label>
              <p v-if="signUpErrors.email" class="mt-1 text-xs text-red-600">{{ signUpErrors.email }}</p>
            </div>

            <div class="relative mb-10">
              <input type="text" id="signup-username" v-model="signUpForm.username" required
                class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                placeholder=" " />
              <label for="signup-username"
                class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                Username
              </label>
              <p v-if="signUpErrors.username" class="mt-1 text-xs text-red-600">{{ signUpErrors.username }}</p>
            </div>

            <div class="relative mb-10">
              <input type="password" id="signup-password" v-model="signUpForm.password" required
                autocomplete="new-password" minlength="6"
                class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                placeholder=" " />
              <label for="signup-password"
                class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                Password (min 6 chars)
              </label>
              <p v-if="signUpErrors.password" class="mt-1 text-xs text-red-600">{{ signUpErrors.password }}</p>
            </div>

            <div class="relative mb-10">
              <input type="password" id="signup-confirm-password" v-model="signUpForm.confirmPassword" required
                autocomplete="new-password"
                class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-brand-purple pb-1 px-1 bg-transparent"
                placeholder=" " />
              <label for="signup-confirm-password"
                class="absolute text-gray-500 text-base duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-brand-purple px-0.5">
                Confirm Password
              </label>
              <p v-if="signUpErrors.confirmPassword" class="mt-1 text-xs text-red-600">{{ signUpErrors.confirmPassword
              }}</p>
            </div>

            <div class="flex justify-end space-x-2 mt-9">
              <button type="button" @click="cancelEmailForm" class="btn btn-outline py-2 px-6">Cancel
              </button>
              <button type="submit" :disabled="isLoading" class="btn btn-primary py-2 px-6"
                :class="{ 'opacity-50 cursor-not-allowed': isLoading }"> {{ isLoading ? 'Creating account...' : 'Submit'
                }}
              </button>
            </div>

            <div class="flex justify-center mt-6">
              <a href="#" class="text-brand-purple text-xs hover:underline">Terms of Service</a>
              <span class="text-gray-400 mx-2 text-xs">•</span>
              <a href="#" class="text-brand-purple text-xs hover:underline">Privacy Policy</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

// Store and Router instances
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Component State
const showSignInForm = ref(false); // Controls visibility of email/password form for sign-in
const isSignUp = ref(false); // Toggles between Sign In and Sign Up modes/forms
const isLoading = ref(false); // Loading indicator for submit buttons
const errorMessage = ref<string | null>(null); // General error message display

// Sign In form state
const signInForm = reactive({
  identifier: '', // Changed from email to match backend
  password: ''
});
const signInErrors = reactive({ // Basic client-side errors
  identifier: '',
  password: ''
});

// Sign Up form state
const signUpForm = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});
const signUpErrors = reactive({ // Basic client-side errors
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});

// --- Methods ---

// Set mode (Sign In vs Sign Up)
const setMode = (signUp: boolean) => {
  isSignUp.value = signUp;
  showSignInForm.value = false; // Hide email form when toggling main mode
  clearFormsAndErrors(); // Clear everything when switching main mode
};

// Clear form fields and errors
const clearFormsAndErrors = () => {
  errorMessage.value = null; // Clear general error
  isLoading.value = false;

  // Clear sign up form
  signUpForm.email = '';
  signUpForm.username = '';
  signUpForm.password = '';
  signUpForm.confirmPassword = '';
  signUpErrors.email = '';
  signUpErrors.username = '';
  signUpErrors.password = '';
  signUpErrors.confirmPassword = '';

  // Clear sign in form
  signInForm.identifier = '';
  signInForm.password = '';
  signInErrors.identifier = '';
  signInErrors.password = '';

};

// Cancel the email form (only relevant for Sign In)
const cancelEmailForm = () => {
  showSignInForm.value = false;
  clearFormsAndErrors();
  // If needed, could also switch back from sign up mode here
  isSignUp.value = false;
};

// Basic Email Validation
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Client-side validation for Sign In
const validateSignIn = (): boolean => {
  let isValid = true;
  signInErrors.identifier = '';
  signInErrors.password = '';

  if (!signInForm.identifier) {
    signInErrors.identifier = 'Please enter your email or username';
    isValid = false;
  }
  if (!signInForm.password) {
    signInErrors.password = 'Please enter your password';
    isValid = false;
  }
  return isValid;
};

// Client-side validation for Sign Up
const validateSignUp = (): boolean => {
  let isValid = true;
  signUpErrors.email = '';
  signUpErrors.username = '';
  signUpErrors.password = '';
  signUpErrors.confirmPassword = '';

  // Validate email
  if (!signUpForm.email) {
    signUpErrors.email = 'Please enter your email';
    isValid = false;
  } else if (!validateEmail(signUpForm.email)) {
    signUpErrors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate username
  if (!signUpForm.username) {
    signUpErrors.username = 'Please enter a username';
    isValid = false;
  } else if (signUpForm.username.length < 3) {
    signUpErrors.username = 'Username must be at least 3 characters';
    isValid = false;
  }

  // Validate password
  if (!signUpForm.password) {
    signUpErrors.password = 'Please enter a password';
    isValid = false;
  } else if (signUpForm.password.length < 6) {
    signUpErrors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  // Validate confirm password
  if (!signUpForm.confirmPassword) {
    signUpErrors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (signUpForm.confirmPassword !== signUpForm.password) {
    signUpErrors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};


// Handle Sign In Submission
const handleSignIn = async () => {
  errorMessage.value = null; // Clear general error
  if (!validateSignIn()) {
    return; // Don't submit if client validation fails
  }
  isLoading.value = true;
  try {
    // Call the Pinia store action
    await authStore.login(signInForm.identifier, signInForm.password);
    // Redirect on success
    const redirectPath = route.query.redirect || '/'; // Redirect to intended page or home
    router.push(redirectPath as string);
  } catch (error: any) {
    console.error('Sign In failed:', error);
    errorMessage.value = error.message || 'Failed to sign in. Please check credentials.';
  } finally {
    isLoading.value = false;
  }
};

// Handle Sign Up Submission
const handleSignUp = async () => {
  errorMessage.value = null; // Clear general error
  if (!validateSignUp()) {
    return; // Don't submit if client validation fails
  }
  isLoading.value = true;
  try {
    // Call the Pinia store action
    await authStore.register(signUpForm.username, signUpForm.email, signUpForm.password);
    // Show success message and switch to Sign In mode
    alert('Registration successful! Please sign in.'); // Replace with a better notification later
    setMode(false); // Switch to Sign In mode
  } catch (error: any) {
    console.error('Sign Up failed:', error);
    errorMessage.value = error.message || 'Failed to create account.';
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
/* Styles for the floating label effect */
input:focus~label,
input:not(:placeholder-shown)~label {
  /* Adjust these values to match the desired floating effect */
  --tw-translate-y: -0.80rem;
  /* How much to move up */
  --tw-scale-x: .75;
  /* How much to shrink */
  --tw-scale-y: .75;
  color: #9333ea;
  /* Use brand-purple */
  /* Add background only if needed for overlap */
  /* background-color: white; */
  /* padding: 0 0.2rem; */
}

/* Optional: Add slight background to label on focus/float to cover line */
input:focus~label,
input:not(:placeholder-shown)~label {
  background-color: #fff;
  /* Match form background */
  padding-left: 0.125rem;
  /* Adjust as needed */
  padding-right: 0.125rem;
  /* Adjust as needed */
  /* Ensure it's above the input border */
  /* z-index: 10; */
  /* Usually not needed if positioned correctly */
}


/* Keep the focus border style */
input:focus {
  border-bottom-width: 2px;
}
</style>