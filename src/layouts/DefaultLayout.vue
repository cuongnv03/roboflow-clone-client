<template>
    <header v-if="route.name !== 'login'" class="header fixed top-0 z-10 w-full bg-white shadow">
        <nav class="mx-auto flex max-w-7xl items-center justify-between py-6" aria-label="Global">
            <div class="flex lg:flex-1">
                <router-link :to="{ name: 'home' }" class="-m-1.5 p-1.5">
                    <span class="sr-only">Roboflow Clone</span>
                    <svg class="h-8 w-auto text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                    </svg>
                </router-link>
            </div>
            <div class="flex lg:flex-1 lg:justify-end">
                <div v-if="authStore.isAuthenticated" class="flex items-center gap-x-4">
                    <router-link :to="{ name: 'projects' }"
                        class="text-sm font-medium text-gray-700 hover:text-gray-900">
                        My Projects
                    </router-link>
                    <span class="text-sm text-gray-600">|</span>
                    <span class="text-sm text-gray-600" title="Logged in user">{{ authStore.currentUser?.username
                    }}</span>
                    <button @click="handleLogout" class="btn btn-outline text-sm py-1 px-3"> Log out
                    </button>
                </div>
            </div>
        </nav>
    </header>

    <main class="mt-[5.3rem]">
        <RouterView />
    </main>

    <button v-if="route.name !== 'login'" class="chat-support" aria-label="Chat Support">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6 md:w-7 md:h-7">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.04 8.25-7.5 8.25a9.75 9.75 0 0 1-3.818-.812A2.25 2.25 0 0 0 7.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18V7.5A2.25 2.25 0 0 1 4.5 5.25h15A2.25 2.25 0 0 1 21.75 7.5V12Z" />
        </svg>
    </button>
</template>

<script setup lang="ts">
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const handleLogout = () => {
    authStore.logout();
    router.push({ name: 'login' });
};
</script>