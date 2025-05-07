<template>
    <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Logo and Navigation Links -->
                <div class="flex">
                    <!-- Logo -->
                    <div class="flex-shrink-0 flex items-center">
                        <router-link to="/" class="text-xl font-bold text-brand-purple flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            Roboflow Clone
                        </router-link>
                    </div>

                    <!-- Main navigation links (desktop) -->
                    <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <router-link to="/projects"
                            class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full"
                            :class="isActive('projects') ? 'border-brand-purple text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'">
                            Projects
                        </router-link>
                        <router-link to="/datasets"
                            class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full"
                            :class="isActive('datasets') ? 'border-brand-purple text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'">
                            Datasets
                        </router-link>
                        <a href="#"
                            class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 h-full">
                            Documentation
                        </a>
                    </div>
                </div>

                <!-- User Menu -->
                <div class="flex items-center">
                    <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">{{ authStore.currentUser?.username }}</span>
                        <button @click="logout" class="btn btn-outline text-sm py-1 px-3">
                            Log Out
                        </button>
                    </div>
                    <div v-else>
                        <router-link to="/login" class="btn btn-primary text-sm py-1 px-3">
                            Sign In
                        </router-link>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="sm:hidden ml-4">
                        <button @click="mobileMenuOpen = !mobileMenuOpen" type="button"
                            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-purple"
                            :aria-expanded="mobileMenuOpen">
                            <span class="sr-only">Open main menu</span>
                            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="sm:hidden">
            <div class="pt-2 pb-3 space-y-1">
                <router-link to="/projects" class="block pl-3 pr-4 py-2 text-base font-medium border-l-4"
                    :class="isActive('projects') ? 'bg-brand-purple bg-opacity-10 border-brand-purple text-brand-purple' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'"
                    @click="mobileMenuOpen = false">
                    Projects
                </router-link>
                <router-link to="/datasets" class="block pl-3 pr-4 py-2 text-base font-medium border-l-4"
                    :class="isActive('datasets') ? 'bg-brand-purple bg-opacity-10 border-brand-purple text-brand-purple' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'"
                    @click="mobileMenuOpen = false">
                    Datasets
                </router-link>
                <a href="#"
                    class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                    Documentation
                </a>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

// Helper function to check if a route is active
const isActive = (routeName: string) => {
    return route.name === routeName || route.path.includes(`/${routeName}`);
};

// Handle logout
const logout = async () => {
    authStore.logout();
    router.push('/login');
    mobileMenuOpen.value = false;
};
</script>