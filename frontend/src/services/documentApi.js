import axios from 'axios';

// Axios instance — same base as api.js but isolated for document work
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 s — Claude Vision can take longer on large images
});

// Unwrap errors cleanly
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

/**
 * analyzeDocument
 *
 * Uploads a file (PDF / image) to POST /api/document/analyze
 * and returns the AI-extracted asset data.
 *
 * @param {File}     file        - Browser File object selected by the user
 * @param {Function} onProgress  - Optional callback(0-100) for upload progress
 * @returns {Promise<{
 *   success: boolean,
 *   asset_found: boolean,
 *   data: Object,
 *   file: Object
 * }>}
 */
export async function analyzeDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);   // backend expects field name "file"

  const response = await api.post('/document/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data;
}

/**
 * uploadDocument  (basic save — used by existing Upload.jsx)
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('document', file);   // old field name

  const response = await api.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data;
}
