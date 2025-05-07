<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <router-link to="/" class="text-xl font-bold text-brand-purple flex items-center">
                            <svg class="h-8 w-8 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                            </svg>
                            Roboflow Clone
                        </router-link>
                    </div>

                    <!-- Navigation Links -->
                    <nav class="hidden md:flex space-x-8">
                        <router-link to="/projects"
                            class="text-gray-900 hover:text-brand-purple px-3 py-2 text-sm font-medium"
                            active-class="text-brand-purple">
                            Projects
                        </router-link>
                        <router-link to="/datasets"
                            class="text-gray-900 hover:text-brand-purple px-3 py-2 text-sm font-medium"
                            active-class="text-brand-purple">
                            Datasets
                        </router-link>
                        <router-link to="/help"
                            class="text-gray-900 hover:text-brand-purple px-3 py-2 text-sm font-medium"
                            active-class="text-brand-purple">
                            Help
                        </router-link>
                    </nav>

                    <!-- User Menu -->
                    <div class="flex items-center gap-x-4">
                        <span v-if="authStore.isAuthenticated" class="text-sm text-gray-600">{{
                            authStore.currentUser?.username }}</span>
                        <button v-if="authStore.isAuthenticated" @click="handleLogout"
                            class="btn btn-outline text-sm py-1 px-3">
                            Log out
                        </button>
                        <router-link v-else to="/login" class="text-brand-purple hover:text-brand-purple-dark">
                            Sign In
                        </router-link>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1">
            <RouterView />
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 py-4">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center text-sm text-gray-500">
                    <p>&copy; {{ new Date().getFullYear() }} Roboflow Clone. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
};
</script>