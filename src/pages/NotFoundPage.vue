<template>
    <DefaultLayout>
        <div class="min-h-[50vh] flex items-center justify-center">
            <div class="text-center">
                <h1 class="text-9xl font-bold text-brand-purple">404</h1>
                <p class="text-xl text-gray-600 mt-4 mb-8">Page not found</p>
                <router-link to="/">
                    <Button class="bg-brand-purple text-white hover:bg-brand-purple-dark transition duration-200"
                        variant="primary">
                        Go Home
                    </Button>
                </router-link>
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Button from '@/components/common/Button.vue';
</script>