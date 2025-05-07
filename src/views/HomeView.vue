<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Welcome to Roboflow Clone
            </h1>
            <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
                Build, train, and deploy computer vision models with ease
            </p>
            <div class="mt-10 flex justify-center">
                <router-link :to="{ name: 'projects' }" class="btn btn-primary px-8 py-3 text-base">
                    Get Started with Projects
                </router-link>
            </div>
        </div>

        <!-- Features Section -->
        <div class="mt-24">
            <h2 class="text-center text-3xl font-extrabold text-gray-900">
                Powerful Computer Vision Tools
            </h2>
            <div class="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
                <!-- Feature 1 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-6 py-8">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-brand-purple rounded-md p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 class="ml-4 text-lg font-medium text-gray-900">Image Annotation</h3>
                        </div>
                        <p class="mt-4 text-base text-gray-500">
                            Easily annotate images for object detection, classification, and segmentation tasks.
                        </p>
                    </div>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-6 py-8">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-brand-purple rounded-md p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 class="ml-4 text-lg font-medium text-gray-900">Model Training</h3>
                        </div>
                        <p class="mt-4 text-base text-gray-500">
                            Train computer vision models on your data with just a few clicks.
                        </p>
                    </div>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-6 py-8">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-brand-purple rounded-md p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                            </div>
                            <h3 class="ml-4 text-lg font-medium text-gray-900">Dataset Management</h3>
                        </div>
                        <p class="mt-4 text-base text-gray-500">
                            Organize, version, and manage your datasets with powerful tools.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// No specific script needed for the home page
</script>