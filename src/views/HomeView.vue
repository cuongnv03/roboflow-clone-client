<template>
    <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Welcome to Roboflow Clone</h1>
        <p class="text-gray-600 mb-6">This is the main dashboard area (Protected Route).</p>
        <div>
            <router-link :to="{ name: 'projects' }" class="btn btn-primary">
                Go to My Projects
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
// No specific script needed for this placeholder
</script>