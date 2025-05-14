<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
            <div class="space-y-4">
                <div>
                    <label for="datasetName" class="block text-sm font-medium text-gray-700 mb-1">
                        Dataset Name <span class="text-red-500">*</span>
                    </label>
                    <input id="datasetName" v-model="formData.name" required type="text"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        placeholder="Enter dataset name" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data Selection</label>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input id="includeAnnotated" v-model="formData.includeAnnotated" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="includeAnnotated" class="ml-2 text-sm text-gray-600">
                                    Include annotated images
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="includeUnlabeled" v-model="formData.includeUnlabeled" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="includeUnlabeled" class="ml-2 text-sm text-gray-600">
                                    Include unannotated images
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Split Ratio</label>
                        <div class="grid grid-cols-3 gap-2">
                            <div>
                                <label for="trainSplit" class="block text-xs text-gray-500">Train</label>
                                <div class="flex items-center">
                                    <input id="trainSplit" v-model.number="formData.splitRatio.train" type="number"
                                        min="0" max="1" step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('train')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label for="validSplit" class="block text-xs text-gray-500">Validation</label>
                                <div class="flex items-center">
                                    <input id="validSplit" v-model.number="formData.splitRatio.valid" type="number"
                                        min="0" max="1" step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('valid')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label for="testSplit" class="block text-xs text-gray-500">Test</label>
                                <div class="flex items-center">
                                    <input id="testSplit" v-model.number="formData.splitRatio.test" type="number"
                                        min="0" max="1" step="0.05"
                                        class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                        @input="updateSplitRatio('test')" />
                                    <span class="ml-1 text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-1">
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div class="flex h-2.5 rounded-full overflow-hidden">
                                    <div class="bg-blue-600" :style="`width: ${formData.splitRatio.train * 100}%`">
                                    </div>
                                    <div class="bg-green-500" :style="`width: ${formData.splitRatio.valid * 100}%`">
                                    </div>
                                    <div class="bg-purple-500" :style="`width: ${formData.splitRatio.test * 100}%`">
                                    </div>
                                </div>
                            </div>
                            <p :class="splitTotal === 1 ? 'text-green-600' : 'text-red-600'" class="text-xs text-right">
                                Total: {{ (splitTotal * 100).toFixed(0) }}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Preprocessing Settings -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Preprocessing</h3>
            <div class="space-y-4">
                <div class="bg-white rounded-lg border border-gray-200 p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-medium text-gray-800">Image Resizing</h4>
                        <div class="flex items-center">
                            <input id="enableResize" v-model="formData.preprocessing.enableResize" type="checkbox"
                                class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                            <label for="enableResize" class="ml-2 text-sm text-gray-600">
                                Enable
                            </label>
                        </div>
                    </div>

                    <div v-if="formData.preprocessing.enableResize" class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="resizeWidth" class="block text-sm text-gray-700 mb-1">Width</label>
                            <input id="resizeWidth" v-model.number="formData.preprocessing.resize.width" type="number"
                                min="1"
                                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                        </div>
                        <div>
                            <label for="resizeHeight" class="block text-sm text-gray-700 mb-1">Height</label>
                            <input id="resizeHeight" v-model.number="formData.preprocessing.resize.height" type="number"
                                min="1"
                                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <div class="flex items-center justify-between">
                            <h4 class="font-medium text-gray-800">Auto-Orient</h4>
                            <div class="flex items-center">
                                <input id="autoOrient" v-model="formData.preprocessing.autoOrient" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="autoOrient" class="ml-2 text-sm text-gray-600">
                                    Enable
                                </label>
                            </div>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">
                            Automatically orient images based on EXIF data
                        </p>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <div class="flex items-center justify-between">
                            <h4 class="font-medium text-gray-800">Normalize</h4>
                            <div class="flex items-center">
                                <input id="normalize" v-model="formData.preprocessing.normalize" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="normalize" class="ml-2 text-sm text-gray-600">
                                    Enable
                                </label>
                            </div>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">
                            Normalize pixel values (0-1)
                        </p>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <div class="flex items-center justify-between">
                            <h4 class="font-medium text-gray-800">Grayscale</h4>
                            <div class="flex items-center">
                                <input id="grayscale" v-model="formData.preprocessing.grayscale" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="grayscale" class="ml-2 text-sm text-gray-600">
                                    Enable
                                </label>
                            </div>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">
                            Convert images to grayscale
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Augmentation Settings -->
        <div>
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium text-gray-900">Data Augmentation</h3>
                <div class="flex items-center">
                    <input id="enableAugmentation" v-model="formData.augmentation.enabled" type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                    <label for="enableAugmentation" class="ml-2 text-sm text-gray-600">
                        Enable Augmentation
                    </label>
                </div>
            </div>

            <div v-if="formData.augmentation.enabled" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 class="font-medium text-gray-800 mb-3">Rotation</h4>
                        <div class="space-y-2">
                            <div>
                                <label for="rotationMin" class="block text-sm text-gray-700 mb-1">Min (degrees)</label>
                                <input id="rotationMin" v-model.number="formData.augmentation.rotation.min"
                                    type="number" min="-180" max="0"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                            <div>
                                <label for="rotationMax" class="block text-sm text-gray-700 mb-1">Max (degrees)</label>
                                <input id="rotationMax" v-model.number="formData.augmentation.rotation.max"
                                    type="number" min="0" max="180"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 class="font-medium text-gray-800 mb-3">Flip</h4>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input id="flipHorizontal" v-model="formData.augmentation.flip.horizontal"
                                    type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="flipHorizontal" class="ml-2 text-sm text-gray-600">
                                    Horizontal Flip
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="flipVertical" v-model="formData.augmentation.flip.vertical" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="flipVertical" class="ml-2 text-sm text-gray-600">
                                    Vertical Flip
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 class="font-medium text-gray-800 mb-3">Brightness</h4>
                        <div class="space-y-2">
                            <div>
                                <label for="brightnessMin" class="block text-sm text-gray-700 mb-1">Min Factor</label>
                                <input id="brightnessMin" v-model.number="formData.augmentation.brightness.min"
                                    type="number" min="0" max="1" step="0.05"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                            <div>
                                <label for="brightnessMax" class="block text-sm text-gray-700 mb-1">Max Factor</label>
                                <input id="brightnessMax" v-model.number="formData.augmentation.brightness.max"
                                    type="number" min="1" max="2" step="0.05"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 class="font-medium text-gray-800 mb-3">Contrast</h4>
                        <div class="space-y-2">
                            <div>
                                <label for="contrastMin" class="block text-sm text-gray-700 mb-1">Min Factor</label>
                                <input id="contrastMin" v-model.number="formData.augmentation.contrast.min"
                                    type="number" min="0" max="1" step="0.05"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                            <div>
                                <label for="contrastMax" class="block text-sm text-gray-700 mb-1">Max Factor</label>
                                <input id="contrastMax" v-model.number="formData.augmentation.contrast.max"
                                    type="number" min="1" max="2" step="0.05"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <div class="flex items-center justify-between h-14">
                            <h4 class="font-medium text-gray-800">Noise</h4>
                            <div class="flex items-center">
                                <input id="noise" v-model="formData.augmentation.noise" type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                <label for="noise" class="ml-2 text-sm text-gray-600">
                                    Add Noise
                                </label>
                            </div>
                        </div>
                        <p class="mt-2 text-xs text-gray-500">
                            Add random noise to improve robustness
                        </p>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-600">Enable data augmentation to create variations of your training data</p>
            </div>
        </div>

        <!-- Form actions -->
        <div class="flex justify-end pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" class="mr-2" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button type="submit" variant="primary" :disabled="isLoading || !isFormValid" :loading="isLoading">
                {{ isLoading ? 'Creating Dataset...' : 'Create Dataset' }}
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import Button from '@/components/common/Button.vue';
import type { DatasetCreateDTO } from '@/types/dataset';

const props = defineProps<{
    projectId: number;
    isLoading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Default form data
const formData = reactive<DatasetCreateDTO>({
    name: '',
    projectId: props.projectId,
    includeAnnotated: true,
    includeUnlabeled: false,
    splitRatio: {
        train: 0.7,
        valid: 0.2,
        test: 0.1
    },
    preprocessing: {
        enableResize: false,
        resize: {
            width: 640,
            height: 640
        },
        autoOrient: true,
        normalize: false,
        grayscale: false
    },
    augmentation: {
        enabled: false,
        rotation: {
            min: -15,
            max: 15
        },
        flip: {
            horizontal: true,
            vertical: false
        },
        brightness: {
            min: 0.8,
            max: 1.2
        },
        contrast: {
            min: 0.8,
            max: 1.2
        },
        noise: false
    }
});

// Computed properties
const splitTotal = computed(() => {
    return formData.splitRatio.train + formData.splitRatio.valid + formData.splitRatio.test;
});

const isFormValid = computed(() => {
    return (
        formData.name.trim() !== '' &&
        Math.abs(splitTotal.value - 1) < 0.001 && // Split should sum to 1
        (formData.includeAnnotated || formData.includeUnlabeled) // At least one type of images
    );
});

// Methods
const updateSplitRatio = (field: 'train' | 'valid' | 'test') => {
    const total = splitTotal.value;

    // If total is greater than 1, adjust other fields proportionally
    if (total > 1) {
        const excess = total - 1;
        const otherFields = ['train', 'valid', 'test'].filter(f => f !== field) as Array<'train' | 'valid' | 'test'>;

        // Distribute excess proportionally between other fields
        const totalOthers = otherFields.reduce((sum, f) => sum + formData.splitRatio[f], 0);

        if (totalOthers > 0) {
            otherFields.forEach(f => {
                const proportion = formData.splitRatio[f] / totalOthers;
                formData.splitRatio[f] = Math.max(0, formData.splitRatio[f] - excess * proportion);
            });
        }
    }

    // Round to 2 decimal places
    Object.keys(formData.splitRatio).forEach(key => {
        formData.splitRatio[key as keyof typeof formData.splitRatio] =
            Math.round(formData.splitRatio[key as keyof typeof formData.splitRatio] * 100) / 100;
    });
};

const handleSubmit = () => {
    if (!isFormValid.value) return;

    emit('submit', { ...formData });
};
</script>