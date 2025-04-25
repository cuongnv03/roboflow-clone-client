<template>
  <div class="w-full">
    <div v-if="!showEmailForm" class="w-full space-y-4">
      <button @click="$emit('show-email-form', true)" class="btn btn-primary flex items-center justify-center w-full py-3">
        <img class="w-5 h-5 mr-3 filter invert brightness-0" alt="" src="/images/mail.svg">
        Continue with Email (or Username)
      </button>
    </div>

    <form v-if="showEmailForm" class="w-full" @submit.prevent="$emit('submit-sign-in', signInForm)">
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
          <button type="button" @click="$emit('cancel-email-form')" class="btn btn-outline py-2 px-6"> Cancel
          </button>
          <button type="submit" :disabled="isLoading" class="btn btn-primary py-2 px-6"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"> {{ isLoading ? 'Signing in...' : 'Submit' }}
          </button>
        </div>
      </div>
    </form>

    <p v-if="!showEmailForm" class="text-xs text-gray-500 mt-6 text-center">
      By continuing, you are indicating that you accept our
      <a href="#" class="text-brand-purple hover:underline">Terms of Service</a> and
      <a href="#" class="text-brand-purple hover:underline">Privacy Policy</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  isLoading: boolean;
  signInErrors: { identifier: string; password: string };
}>();

const emit = defineEmits(['show-email-form', 'submit-sign-in', 'cancel-email-form']);

const showEmailForm = ref(false);
const signInForm = reactive({
  identifier: '',
  password: '',
});
</script>

<style scoped>
/* Styles for the floating label effect */
input:focus~label,
input:not(:placeholder-shown)~label {
  /* Adjust these values to match the desired floating effect */
  --tw-translate-y: -0.80rem;
  --tw-scale-x: .75;
  --tw-scale-y: .75;
  color: #9333ea;
}

/* Add slight background to label on focus/float to cover line */
input:focus~label,
input:not(:placeholder-shown)~label {
  background-color: #fff;
  padding-left: 0.125rem;
  padding-right: 0.125rem;
}

/* Keep the focus border style */
input:focus {
  border-bottom-width: 2px;
}
</style>
