<template>
    <DefaultLayout>
        <div class="max-w-lg mx-auto py-10 px-4">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
                <!-- Profile info section -->
                <div class="p-6 space-y-4">
                    <h2 class="text-lg font-semibold text-gray-800">Profile</h2>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input v-model="form.username" type="text"
                            class="input w-full" placeholder="Username" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input v-model="form.email" type="email"
                            class="input w-full" placeholder="Email address" />
                    </div>
                </div>

                <!-- Password section -->
                <div class="p-6 space-y-4">
                    <h2 class="text-lg font-semibold text-gray-800">Change Password</h2>
                    <p class="text-sm text-gray-500">Leave blank to keep your current password.</p>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input v-model="form.password" type="password"
                            class="input w-full" placeholder="New password" autocomplete="new-password" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input v-model="confirmPassword" type="password"
                            class="input w-full" placeholder="Confirm new password" autocomplete="new-password" />
                        <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">Passwords do not match.</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="p-6 flex items-center justify-between">
                    <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
                    <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
                    <span v-else />

                    <button @click="saveProfile" :disabled="saving || passwordMismatch"
                        class="btn btn-primary">
                        {{ saving ? 'Saving…' : 'Save Changes' }}
                    </button>
                </div>
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const authStore = useAuthStore();

const form = ref({
    username: '',
    email: '',
    password: '',
});
const confirmPassword = ref('');
const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const passwordMismatch = computed(() =>
    form.value.password.length > 0 && form.value.password !== confirmPassword.value
);

onMounted(() => {
    if (authStore.currentUser) {
        form.value.username = authStore.currentUser.username;
        form.value.email = authStore.currentUser.email;
    }
});

const saveProfile = async () => {
    if (passwordMismatch.value) return;

    saving.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    try {
        const payload: { username?: string; email?: string; password?: string } = {
            username: form.value.username,
            email: form.value.email,
        };

        if (form.value.password) {
            payload.password = form.value.password;
        }

        await authStore.updateProfile(payload);
        form.value.password = '';
        confirmPassword.value = '';
        successMessage.value = 'Profile updated successfully.';
    } catch (err: any) {
        errorMessage.value = err?.message || 'Failed to update profile.';
    } finally {
        saving.value = false;
    }
};
</script>
