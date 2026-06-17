import axios from 'axios';

// ── Axios instance pointing to the backend ─────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',        // Vite proxy forwards /api → http://localhost:5000/api
  timeout: 60000,         // 60s to handle Render free-tier cold starts
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor: unwrap errors cleanly ────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
//  sendMessage  — the primary function used by Chat.jsx
//
//  @param {string} message   - The user's text
//  @param {string} language  - e.g. "English", "Hindi", "Kannada"
//  @param {string} sessionId - Unique per browser session
//  @returns {Promise<{ success, reply, sessionId }>}
// ─────────────────────────────────────────────────────────────────────────────
export async function sendMessage(message, language = 'English', sessionId = 'default') {
  const response = await api.post('/chat', { message, language, sessionId });
  return response.data;   // { success: true, reply: "...", sessionId: "..." }
}

// Alias kept for any component that already uses the old name
export const sendChatMessage = sendMessage;

// ─────────────────────────────────────────────────────────────────────────────
//  clearChatSession — tells the backend to wipe this session's history
// ─────────────────────────────────────────────────────────────────────────────
export async function clearChatSession(sessionId) {
  const response = await api.post('/chat/clear', { sessionId });
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────────
//  uploadDocument — multipart upload (PDF / image)
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('document', file);

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

// ─────────────────────────────────────────────────────────────────────────────
//  Claim helpers
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeClaim(claimData) {
  const response = await api.post('/claim/analyze', { claimData });
  return response.data;
}

export async function getClaimStatus(claimId) {
  const response = await api.get(`/claim/${claimId}`);
  return response.data;
}
