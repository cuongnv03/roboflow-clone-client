<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="container py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-purple-600">ImagePrepPal</h1>
          <p class="text-gray-500 text-sm">Easily prepare your images for annotation</p>
        </div>
      </div>
    </header>

    <main class="container py-8 space-y-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Upload Data</h2>

        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Drag and drop image files or click to browse your files.
              Supported formats: JPG, PNG, BMP, WEBP, AVIF, MOV, MP4.
              Max size: 20MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader />
          </CardContent>
        </Card>

        <div class="space-y-4 mt-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Your Images</h2>
          </div>
          <Separator />
          <ImageGallery />
        </div>

        <div class="flex justify-end mt-6">
          <Button size="lg" class="gap-2">
            Save and Continue
            <ArrowRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>

    <ImagePreview />
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import ImageUploader from '@/components/images/ImageUploader.vue'
import ImageGallery from '@/components/images/ImageGallery.vue'
import ImagePreview from '@/components/images/ImagePreview.vue'

// UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Button } from '@/components/ui'
</script>
