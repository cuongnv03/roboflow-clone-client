// src/services/imageService.ts
import axios from 'axios';
import type { ImageFile } from '@/stores/image'; // Import ImageFile type

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
axios.defaults.baseURL = API_BASE_URL;

// Ví dụ hàm upload nhiều ảnh

