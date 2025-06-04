<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Header -->
        <Navbar />

        <!-- Main Content -->
        <main class="flex-1">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <slot />
            </div>
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
import Navbar from '@/components/layout/Navbar.vue';
</script>