<template>
    <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-purple-500">
        <div class="bg-white rounded-lg shadow-xl px-20 py-10 w-full max-w-md">
            <div class="flex flex-col items-center">
                <!-- Logo -->
                <a href="/" class="flex justify-center items-center m-0">
                    <img src="/images/logo.png" alt="Roboflow" class="w-3/5 h-3/5 mb-4">
                </a>

                <!-- Sign In/Up Text -->
                <p class="text-gray-500 mb-8">
                    <span @click="isSignUp = false" class="cursor-pointer"
                        :class="{ 'text-purple-600 font-medium': !isSignUp }">
                        Sign In
                    </span>
                    or
                    <span @click="isSignUp = true" class="cursor-pointer"
                        :class="{ 'text-purple-600 font-medium': isSignUp }">
                        Sign Up
                    </span>
                </p>

                <!-- Sign In Form -->
                <div v-if="!isSignUp" class="w-full">
                    <!-- Login Button -->
                    <div v-if="!showSignInForm" class="w-full space-y-4">
                        <!-- Email Button -->
                        <button @click="showSignInForm = true"
                            class="flex items-center justify-center w-full bg-purple-600 rounded-md py-3 px-4 text-white hover:bg-purple-300 transition-colors hover:shadow-sm hover:shadow-gray-100">
                            <img class="w-5 h-5 mr-3" alt="" src="/images/mail.svg">
                            Continue with Email
                        </button>
                    </div>

                    <!-- Email Form (shown when showSignInForm is true) -->
                    <div v-if="showSignInForm" class="w-full">
                        <div class="bg-white rounded-md w-full">
                            <div class="p-2">
                                <div class="relative mb-10">
                                    <input type="email" id="signin-email" v-model="signInForm.email"
                                        class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                                        placeholder=" " />
                                    <label for="signin-email"
                                        class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                                        Email
                                    </label>
                                    <p v-if="signInErrors.email" class="mt-1 text-sm text-red-600">{{ signInErrors.email
                                        }}</p>
                                </div>

                                <div class="relative mb-10">
                                    <input type="password" id="signin-password" v-model="signInForm.password"
                                        class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                                        placeholder=" " />
                                    <label for="signin-password"
                                        class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                                        Password
                                    </label>
                                    <p v-if="signInErrors.password" class="mt-1 text-sm text-red-600">{{
                                        signInErrors.password
                                    }}</p>
                                </div>

                                <div class="flex justify-self-end space-x-2 mt-9">
                                    <button @click="clearForm"
                                        class="border border-white text-gray-600 text-sm font-normal py-2 px-8 rounded-md hover:border-gray-300 hover:shadow-md">
                                        Cancel
                                    </button>
                                    <button @click="handleSignIn"
                                        class="bg-purple-600 hover:bg-purple-300 text-white text-sm font-normal py-2 px-8 rounded-md hover:shadow-md hover:shadow-gray-100">
                                        Submit
                                    </button>
                                </div>
                            </div>

                            <div class="flex justify-center mt-6">
                                <a href="#" class="text-purple-600 text-xs hover:underline">Terms of Service</a>
                                <span class="text-gray-400 mx-2 text-xs">•</span>
                                <a href="#" class="text-purple-600 text-xs hover:underline">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                    <!-- Terms (only shown when not showing email form) -->
                    <p v-if="!showSignInForm" class="text-xs text-gray-500 mt-6 text-center">
                        By continuing, you are indicating that you accept our
                        <a href="#" class="text-purple-600 hover:underline">Terms of Service</a> and
                        <a href="#" class="text-purple-600 hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                <div v-if="isSignUp" class="w-full">
                    <div class="relative mb-10">
                        <input type="email" id="signup-email" v-model="signUpForm.email"
                            class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                            placeholder=" " />
                        <label for="signup-email"
                            class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                            Email
                        </label>
                        <p v-if="signUpErrors.email" class="mt-1 text-sm text-red-600">{{ signUpErrors.email
                            }}</p>
                    </div>

                    <div class="relative mb-10">
                        <input type="username" id="signup-username" v-model="signUpForm.username"
                            class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                            placeholder=" " />
                        <label for="signup-username"
                            class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                            Username
                        </label>
                        <p v-if="signUpErrors.username" class="mt-1 text-sm text-red-600">{{ signUpErrors.username
                            }}</p>
                    </div>

                    <div class="relative mb-10">
                        <input type="password" id="signup-password" v-model="signUpForm.password"
                            class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                            placeholder=" " />
                        <label for="signup-password"
                            class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                            Password
                        </label>
                        <p v-if="signUpErrors.password" class="mt-1 text-sm text-red-600">{{ signUpErrors.password
                            }}</p>
                    </div>

                    <div class="relative mb-10">
                        <input type="password" id="signup-confirm-password" v-model="signUpForm.confirmPassword"
                            class="peer w-full border-b border-gray-300 text-gray-900 text-base focus:outline-none focus:border-purple-600 scroll-pt-0.5 pb-1 px-3 bg-transparent"
                            placeholder=" " />
                        <label for="signup-confirm-password"
                            class="absolute text-gray-500 text-xl duration-300 transform left-0 -top-3.5 scale-75 origin-[0] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-purple-600 px-0.5">
                            Confirm Password
                        </label>
                        <p v-if="signUpErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{
                            signUpErrors.confirmPassword
                            }}</p>
                    </div>

                    <div class="flex justify-self-end space-x-2 mt-9">
                        <button @click="clearForm"
                            class="border border-white text-gray-600 text-sm font-normal py-2 px-8 rounded-md hover:border-gray-300 hover:shadow-md">
                            Cancel
                        </button>
                        <button @click="handleSignUp"
                            class="bg-purple-600 hover:bg-purple-300 text-white text-sm font-normal py-2 px-8 rounded-md hover:shadow-md hover:shadow-gray-100">
                            Submit
                        </button>
                    </div>

                    <div class="flex justify-center mt-6">
                        <a href="#" class="text-purple-600 text-xs hover:underline">Terms of Service</a>
                        <span class="text-gray-400 mx-2 text-xs">•</span>
                        <a href="#" class="text-purple-600 text-xs hover:underline">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'

export default defineComponent({
    name: 'LoginPage',
    setup() {
        const showSignInForm = ref(false);
        const isSignUp = ref(false);

        // Sign In form state
        const signInForm = reactive({
            email: '',
            password: ''
        });

        const signInErrors = reactive({
            email: '',
            password: ''
        });

        // Sign Up form state
        const signUpForm = reactive({
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        });

        const signUpErrors = reactive({
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        });

        const clearForm = () => {
            if (isSignUp.value) {
                isSignUp.value = false;
            }
            showSignInForm.value = false;
            // Clear sign in form
            signInForm.email = '';
            signInForm.password = '';
            signInErrors.email = '';
            signInErrors.password = '';

            // Clear sign up form
            signUpForm.email = '';
            signUpForm.username = '';
            signUpForm.password = '';
            signUpForm.confirmPassword = '';
            signUpErrors.email = '';
            signUpErrors.username = '';
            signUpErrors.password = '';
            signUpErrors.confirmPassword = '';
        };

        const validateEmail = (email: string): boolean => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        };

        const handleSignIn = () => {
            let isValid = true;

            // Validate email
            if (!signInForm.email) {
                signInErrors.email = 'Please enter your email';
                isValid = false;
            } else if (!validateEmail(signInForm.email)) {
                signInErrors.email = 'Please enter a valid email address';
                isValid = false;
            } else {
                signInErrors.email = '';
            }

            // Validate password
            if (!signInForm.password) {
                signInErrors.password = 'Please enter your password';
                isValid = false;
            } else {
                signInErrors.password = '';
            }

            if (isValid) {
                console.log('Sign In with:', signInForm);
                // Here you would typically call your authentication service
            }
        };

        const handleSignUp = () => {
            let isValid = true;

            // Validate email
            if (!signUpForm.email) {
                signUpErrors.email = 'Please enter your email';
                isValid = false;
            } else if (!validateEmail(signUpForm.email)) {
                signUpErrors.email = 'Please enter a valid email address';
                isValid = false;
            } else {
                signUpErrors.email = '';
            }

            // Validate username
            if (!signUpForm.username) {
                signUpErrors.username = 'Please enter a username';
                isValid = false;
            } else if (signUpForm.username.length < 3) {
                signUpErrors.username = 'Username must be at least 3 characters';
                isValid = false;
            } else {
                signUpErrors.username = '';
            }

            // Validate password
            if (!signUpForm.password) {
                signUpErrors.password = 'Please enter a password';
                isValid = false;
            } else if (signUpForm.password.length < 6) {
                signUpErrors.password = 'Password must be at least 6 characters';
                isValid = false;
            } else {
                signUpErrors.password = '';
            }

            // Validate confirm password
            if (!signUpForm.confirmPassword) {
                signUpErrors.confirmPassword = 'Please confirm your password';
                isValid = false;
            } else if (signUpForm.confirmPassword !== signUpForm.password) {
                signUpErrors.confirmPassword = 'Passwords do not match';
                isValid = false;
            } else {
                signUpErrors.confirmPassword = '';
            }

            if (isValid) {
                console.log('Sign Up with:', signUpForm);
                // Here you would typically call your registration service
            }
        };

        return {
            showSignInForm,
            isSignUp,
            signInForm,
            signInErrors,
            signUpForm,
            signUpErrors,
            clearForm,
            handleSignIn,
            handleSignUp
        };
    }
})
</script>

<style scoped>
/* input:focus~label,
input:not(:placeholder-shown)~label {
    transform: translateY(-4px) scale(0.75);
    background-color: white;
    padding: 0 0.2rem;
    color: #9333ea;
} */
input:focus~label,
input:not(:placeholder-shown)~label {
    color: #9333ea;
    transform: translateY(-14px) scale(0.75);
}

input:focus {
    border-bottom-width: 2px;
}
</style>